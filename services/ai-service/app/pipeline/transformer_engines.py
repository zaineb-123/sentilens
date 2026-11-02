"""Production engines backed by pretrained Hugging Face models (CPU inference).

Heavy imports are lazy so the lexicon engine and unit tests work without torch installed.
NOTE: these classes could not be exercised in the build sandbox (no access to huggingface.co);
they are exercised by tests/test_transformers_engine.py, which is skipped unless
AI_RUN_MODEL_TESTS=1 and the models are available.
"""
from typing import Optional

from ..errors import EngineError
from .lexicon_engines import EMOTIONS

_POLARITY_ALIASES = {
    "negative": "negative", "neutral": "neutral", "positive": "positive",
    "label_0": "negative", "label_1": "neutral", "label_2": "positive",
}
# English hypotheses work for multilingual NLI models on FR/EN/AR premises.
_EMOTION_PHRASES = {
    "joy": "joy", "satisfaction": "satisfaction", "frustration": "frustration", "anger": "anger",
    "sadness": "sadness", "fear": "fear", "surprise": "surprise", "neutral": "no strong emotion",
}


class TransformersSentiment:
    def __init__(self, model_id: str):
        self.name = model_id
        try:
            from transformers import pipeline

            self._pipe = pipeline(
                "text-classification", model=model_id, top_k=None, truncation=True, max_length=256
            )
        except Exception as exc:  # noqa: BLE001
            raise EngineError(f"cannot load sentiment model {model_id}: {exc}") from exc

    def predict(self, texts: list[str]) -> list[dict[str, float]]:
        try:
            raw = self._pipe(texts, batch_size=16)
        except Exception as exc:  # noqa: BLE001
            raise EngineError(f"sentiment inference failed: {exc}") from exc
        out = []
        for row in raw:
            scores = {_POLARITY_ALIASES[r["label"].lower()]: float(r["score"]) for r in row
                      if r["label"].lower() in _POLARITY_ALIASES}
            if set(scores) != {"positive", "neutral", "negative"}:
                raise EngineError(f"unexpected sentiment labels: {[r['label'] for r in row]}")
            out.append(scores)
        return out


class TransformersEmotion:
    """Zero-shot emotion detection with a multilingual NLI model (multi-label)."""

    def __init__(self, model_id: str):
        self.name = model_id
        try:
            from transformers import pipeline

            self._pipe = pipeline("zero-shot-classification", model=model_id)
        except Exception as exc:  # noqa: BLE001
            raise EngineError(f"cannot load emotion model {model_id}: {exc}") from exc

    def predict(self, texts: list[str]) -> list[dict[str, float]]:
        labels = list(_EMOTION_PHRASES.values())
        inverse = {v: k for k, v in _EMOTION_PHRASES.items()}
        out = []
        try:
            for text in texts:
                res = self._pipe(text, candidate_labels=labels,
                                 hypothesis_template="This text expresses {}.", multi_label=True)
                raw = {inverse[l]: float(s) for l, s in zip(res["labels"], res["scores"])}
                total = sum(raw.values()) or 1.0
                out.append({e: raw.get(e, 0.0) / total for e in EMOTIONS})
        except Exception as exc:  # noqa: BLE001
            raise EngineError(f"emotion inference failed: {exc}") from exc
        return out


class EmbeddingAspectMatcher:
    """Semantic fallback: match clauses the lexicon missed to the fixed aspects (e5 embeddings)."""

    def __init__(self, model_id: str, descriptions: dict[str, str], threshold: float):
        self.name = model_id
        self.threshold = threshold
        try:
            import torch
            from transformers import AutoModel, AutoTokenizer

            self._torch = torch
            self._tok = AutoTokenizer.from_pretrained(model_id)
            self._model = AutoModel.from_pretrained(model_id).eval()
        except Exception as exc:  # noqa: BLE001
            raise EngineError(f"cannot load embedding model {model_id}: {exc}") from exc
        self._keys = list(descriptions)
        self._matrix = self._embed([f"passage: {d}" for d in descriptions.values()])

    def _embed(self, texts: list[str]):
        torch = self._torch
        with torch.no_grad():
            batch = self._tok(texts, padding=True, truncation=True, max_length=128, return_tensors="pt")
            hidden = self._model(**batch).last_hidden_state
            mask = batch["attention_mask"].unsqueeze(-1)
            pooled = (hidden * mask).sum(1) / mask.sum(1)
            return torch.nn.functional.normalize(pooled, dim=1)

    def match(self, clauses: list[str]) -> list[Optional[str]]:
        if not clauses:
            return []
        try:
            sims = self._embed([f"query: {c}" for c in clauses]) @ self._matrix.T
        except Exception as exc:  # noqa: BLE001
            raise EngineError(f"embedding inference failed: {exc}") from exc
        result: list[Optional[str]] = []
        for row in sims:
            best = int(row.argmax())
            result.append(self._keys[best] if float(row[best]) >= self.threshold else None)
        return result
