"""Language detection (FR / EN / AR) with an explicit, honest experimental flag for Tunisian input.

Arabic script  -> Arabic (Tunisian dialect markers are flagged as experimental).
Latin script   -> heuristic Arabizi check first, then `lingua` (FR vs EN).
"""
import re
import threading
from typing import Optional

from ..schemas import LanguageInfo
from .text_utils import letter_counts, normalize

_ARABIZI_DIGIT_WORD = re.compile(r"(?<![^\W_])(?:[235679][a-z]{2,}|[a-z]{2,}[235679][a-z]*)(?![^\W_])")
_ARABIZI_MARKERS = {
    "barcha", "mochkla", "mouch", "khedma", "flous", "behi", "yaatik", "ya3tik", "nheb", "nekrah",
    "mafamech", "famech", "chkoun", "9adech", "bech", "aslema", "yezzi", "3andi", "3andna", "kifech",
    "lezem", "tawa", "haja", "zmayel", "idara", "moudir", "mrigel", "khayeb", "zwin", "ta3ab",
}
_TUNISIAN_AR_MARKERS = {"برشا", "برشة", "باهي", "مانيش", "ماهيش", "ماهوش", "توا", "توة", "شنوة", "فما", "ياخي"}

_detector = None
_lock = threading.Lock()


def _get_detector():
    global _detector
    with _lock:
        if _detector is None:
            from lingua import Language, LanguageDetectorBuilder

            _detector = (
                LanguageDetectorBuilder.from_languages(Language.FRENCH, Language.ENGLISH, Language.ARABIC)
                .with_preloaded_language_models()
                .build()
            )
    return _detector


def is_arabizi(text: str) -> bool:
    norm = normalize(text)
    tokens = re.findall(r"[^\W_]+", norm)
    markers = sum(1 for t in tokens if t in _ARABIZI_MARKERS)
    digits = len(_ARABIZI_DIGIT_WORD.findall(norm))
    score = markers + digits
    return (markers >= 1 and score >= 2) or digits >= 2 or markers >= 2


def detect_language(text: str, hint: Optional[str] = None) -> LanguageInfo:
    ar, lat = letter_counts(text)
    total = ar + lat
    if total == 0:
        return LanguageInfo(code=hint or "und", script="none", confidence=0.0 if not hint else 0.3)

    if ar / total >= 0.5:
        tokens = set(re.findall(r"[^\W_]+", text))
        dialect = "tunisian_arabic_markers" if tokens & _TUNISIAN_AR_MARKERS else None
        return LanguageInfo(
            code="ar",
            script="arabic" if ar == total else "mixed",
            confidence=0.98,
            dialect=dialect,
            experimental=dialect is not None,
        )

    if is_arabizi(text):
        # Heuristic only: transliterated Tunisian Arabic is NOT reliably understood by the models.
        return LanguageInfo(
            code="ar", script="latin", confidence=0.6, dialect="tunisian_arabizi", experimental=True
        )

    from lingua import Language

    values = _get_detector().compute_language_confidence_values(text)
    top = values[0]
    code = {Language.FRENCH: "fr", Language.ENGLISH: "en", Language.ARABIC: "ar"}[top.language]
    conf = float(top.value)
    if conf < 0.5 and hint:
        return LanguageInfo(code=hint, script="latin", confidence=conf)
    return LanguageInfo(code=code, script="latin" if ar == 0 else "mixed", confidence=round(conf, 4))
