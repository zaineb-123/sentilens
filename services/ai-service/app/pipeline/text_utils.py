import re
import unicodedata

_AR_LETTER = re.compile(r"[\u0621-\u064A\u0671-\u06D3]")
_LAT_LETTER = re.compile(r"[A-Za-z\u00C0-\u024F]")
_AR_MAP = str.maketrans(
    {"ى": "ي", "ة": "ه", "ٱ": "ا", "ـ": None, "’": "'", "‘": "'", "`": "'"}
)
_AR_DIACRITICS = re.compile(r"[\u064B-\u065F\u0670\u0640]")


def has_arabic(s: str) -> bool:
    return bool(_AR_LETTER.search(s))


def letter_counts(s: str) -> tuple[int, int]:
    return len(_AR_LETTER.findall(s)), len(_LAT_LETTER.findall(s))


def strip_arabic_diacritics(s: str) -> str:
    return _AR_DIACRITICS.sub("", s)


def normalize(text: str) -> str:
    """Lowercase, strip accents/diacritics, unify Arabic letter variants, hyphens -> spaces."""
    text = unicodedata.normalize("NFKD", text.lower())
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.translate(_AR_MAP)
    text = re.sub(r"[-_]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def tokenize(norm: str) -> list[str]:
    norm = re.sub(r"n't\b", " not", norm)
    return re.findall(r"[^\W_]+", norm)


def arabic_variants(token: str) -> set[str]:
    """Token plus versions with common clitics (ال, و, ب, ل, ف, ك) removed."""
    out = {token}
    if token.startswith("ال") and len(token) > 3:
        out.add(token[2:])
    if token[:1] in "وبلفك" and len(token) > 3:
        out.add(token[1:])
        if token[1:].startswith("ال") and len(token) > 5:
            out.add(token[3:])
    return out


def ar_token_matches(token: str, term: str, allow: int) -> bool:
    for v in arabic_variants(token):
        if v == term or (v.startswith(term) and len(v) - len(term) <= allow):
            return True
    return False
