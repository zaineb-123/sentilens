import re
import time
from collections import defaultdict
from typing import Optional

from ..config import Settings
from ..errors import EngineError
from .aspect_catalog import AspectCatalog
from .language import detect_language
from .lexicon_engines import EMOTIONS, is_polar_token
from .segmenter import split_clauses
from .text_utils import has_arabic, normalize, strip_arabic_diacritics, tokenize

_STOPWORDS = set(
    "the a an and or of to in on for with is are was were be been it its this that these those i we you they "
    "my our your their me us them at as by from very really quite too so more much many some any not no "
    "le la les un une des du de et ou en dans sur pour avec est sont etait ete je nous vous ils elles mon "
    "ma mes notre nos votre vos leur leurs ce cet cette ces au aux qui que quoi dont tres trop plus tout "
    "tous toute pas ne se sa son ses c d l n s t j m y there here have has had do does don doesn".split()
)


class Analyzer:
    def __init__(self, settings: Settings, sentiment, emotion, catalog: AspectCatalog, embedder=None):
        self.s, self.sentiment, self.emotion = settings, sentiment, emotion
        self.catalog, self.embedder = catalog, embedder

    # ---------------------------------------------------------------- public
    def analyze(self, text: str, hint: Optional[str] = None) -> dict:
        return self.analyze_many([(text, hint)])[0]

    def analyze_many(self, items: list[tuple[str, Optional[str]]]) -> list[dict]:
        started = time.perf_counter()
        prepared = []
        for text, hint in items:
            clean = strip_arabic_diacritics(re.sub(r"\s+", " ", text)).strip()
            prepared.append((clean, detect_language(clean, hint), split_clauses(clean)))

        flat = [c for _, _, clauses in prepared for c in clauses]
        clause_scores = self.sentiment.predict(flat)
        emotion_scores = self.emotion.predict([p[0] for p in prepared])
        if len(clause_scores) != len(flat) or len(emotion_scores) != len(prepared):
            raise EngineError("engine returned an unexpected number of results")

        results, cursor = [], 0
        elapsed_ms = (time.perf_counter() - started) * 1000
        for (clean, lang, clauses), emo in zip(prepared, emotion_scores):
            scores = clause_scores[cursor: cursor + len(clauses)]
            cursor += len(clauses)
            results.append(self._assemble(clean, lang, clauses, scores, emo, elapsed_ms / len(prepared)))
        return results

    def models(self) -> dict:
        return {
            "sentiment": getattr(self.sentiment, "name", None),
            "emotion": getattr(self.emotion, "name", None),
            "embedding": getattr(self.embedder, "name", None),
        }

    # --------------------------------------------------------------- internal
    def _assemble(self, text, lang, clauses, scores, emo, ms) -> dict:
        s = self.s
        factor = s.experimental_confidence_factor if lang.experimental else 1.0
        warnings: list[str] = []
        if s.engine == "lexicon":
            warnings.append("Lexicon engine (development mode): not the production NLP models.")
        if lang.dialect == "tunisian_arabizi":
            warnings.append("Tunisian Arabizi detected: EXPERIMENTAL. Models are not trained for "
                            "transliterated dialect; confidence is reduced and results may be wrong.")
        elif lang.dialect == "tunisian_arabic_markers":
            warnings.append("Tunisian dialect markers detected: EXPERIMENTAL. Understanding of the "
                            "dialect is partial; confidence is reduced.")

        clause_rows = []
        unmatched = []
        for i, (clause, sc) in enumerate(zip(clauses, scores)):
            label = max(("positive", "neutral", "negative"), key=lambda k: sc[k])
            row = {"text": clause, "label": label, "conf": sc[label], "scores": sc, "aspects": []}
            row["aspects"] = [(k, "fixed") for k in self.catalog.match(normalize(clause))]
            if not row["aspects"]:
                unmatched.append(i)
            clause_rows.append(row)

        if unmatched and self.embedder is not None:
            for i, key in zip(unmatched, self.embedder.match([clauses[i] for i in unmatched])):
                if key:
                    clause_rows[i]["aspects"] = [(key, "fixed")]
        for r in clause_rows:
            if not r["aspects"] and r["label"] != "neutral" and r["conf"] >= s.confident_threshold:
                cand = self._emergent(r["text"])
                if cand:
                    r["aspects"] = [(cand, "emergent")]

        # ---- overall sentiment
        weights = [max(1, len(r["text"].split())) for r in clause_rows]
        wsum = sum(weights)
        agg = {k: sum(w * r["scores"][k] for w, r in zip(weights, clause_rows)) / wsum
               for k in ("positive", "neutral", "negative")}
        pos_conf = [r["conf"] for r in clause_rows if r["label"] == "positive" and r["conf"] >= s.confident_threshold]
        neg_conf = [r["conf"] for r in clause_rows if r["label"] == "negative" and r["conf"] >= s.confident_threshold]
        if pos_conf and neg_conf:
            label, conf = "mixed", min(max(pos_conf), max(neg_conf))
        else:
            label = max(agg, key=agg.get)
            conf = agg[label]

        # ---- aspects
        by_key: dict[str, list] = defaultdict(list)
        kinds: dict[str, str] = {}
        for r in clause_rows:
            for key, kind in r["aspects"]:
                by_key[key].append((r["label"], r["conf"]))
                kinds[key] = kind
        aspects = []
        for key, obs in by_key.items():
            confident = [(l, c) for l, c in obs if l != "neutral" and c >= s.confident_threshold]
            kinds_seen = {l for l, _ in confident}
            if {"positive", "negative"} <= kinds_seen:
                sent, c = "mixed", min(max(c for l, c in confident if l == "positive"),
                                       max(c for l, c in confident if l == "negative"))
            else:
                sent, c = max(obs, key=lambda o: o[1])
            if kinds[key] == "emergent":
                c *= 0.7
            aspects.append({
                "key": key,
                "label": self.catalog.label(key) if kinds[key] == "fixed" else self._emergent_label(key),
                "type": kinds[key], "sentiment": sent,
                "confidence": round(c * factor, 4), "mentions": len(obs),
            })
        aspects.sort(key=lambda a: (-a["mentions"], -a["confidence"]))

        ranked = sorted(((e, float(emo.get(e, 0.0))) for e in EMOTIONS), key=lambda x: -x[1])
        return {
            "language": lang.model_dump(),
            "sentiment": {"label": label, "confidence": round(conf * factor, 4),
                          "scores": {k: round(v, 4) for k, v in agg.items()}},
            "emotions": {"primary": ranked[0][0],
                         "scores": [{"label": e, "score": round(v, 4)} for e, v in ranked]},
            "aspects": aspects,
            "meta": {"engine": s.engine, "models": self.models(), "clauses": len(clauses),
                     "processing_ms": round(ms, 2), "warnings": warnings},
        }

    @staticmethod
    def _emergent(clause: str) -> Optional[str]:
        """Heuristic candidate for a topic outside the fixed list (Latin script only)."""
        if has_arabic(clause):
            return None
        picked: list[str] = []
        for tok in tokenize(normalize(clause)):
            ok = len(tok) >= 4 and tok.isalpha() and tok not in _STOPWORDS and not is_polar_token(tok)
            if ok:
                picked.append(tok)
                if len(picked) == 2:
                    break
            elif picked:
                break
        return "emergent:" + "_".join(picked) if picked else None

    @staticmethod
    def _emergent_label(key: str) -> dict[str, str]:
        name = key.split(":", 1)[1].replace("_", " ").capitalize()
        return {"en": name, "fr": name, "ar": name}
