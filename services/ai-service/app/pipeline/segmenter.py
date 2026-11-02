import re

MAX_CLAUSES = 12
_SENTENCE = re.compile(r"(?<=[.!?؟;…])\s+|\n+")
_W = r"(?<![^\W_])(?:%s)(?![^\W_])"
_CONTRAST = re.compile(
    _W
    % (
        "but|however|although|though|while|whereas|yet|mais|cependant|pourtant|toutefois|"
        "n[ée]anmoins|bien\\s+que|alors\\s+que|tandis\\s+que|walakin|lakin|"
        "لكن|ولكن|لكني|لكنني|غير\\s+[أا]ن|[إا]لا\\s+[أا]ن|بينما|رغم\\s+[أا]ن|بالرغم\\s+من|في\\s+حين"
    ),
    re.IGNORECASE,
)
_COMMA = re.compile(r"\s*[,،:]\s*")
_COORD = re.compile(r"\s+(?:and|et)\s+", re.IGNORECASE)
_TRIM = " ,;:-–—\t"
MIN_WORDS = 3


def _words(s: str) -> int:
    return len(s.split())


def _merge_short(pieces: list[str]) -> list[str]:
    """Merge fragments shorter than MIN_WORDS into a neighbour ('quiet' should not be a clause)."""
    out: list[str] = []
    carry = ""
    for p in (x.strip(_TRIM) for x in pieces):
        if not p:
            continue
        p = f"{carry} {p}".strip() if carry else p
        carry = ""
        if _words(p) < MIN_WORDS:
            carry = p
        else:
            out.append(p)
    if carry:
        if out:
            out[-1] = f"{out[-1]} {carry}"
        else:
            out.append(carry)
    return out


def split_clauses(text: str) -> list[str]:
    """Split feedback into clauses: sentences -> contrast markers -> commas -> coordinators.

    'I love the team but the workload is too high.' -> ['I love the team', 'the workload is too high']
    """
    clauses: list[str] = []
    for sentence in _SENTENCE.split(text.strip()):
        for part in _CONTRAST.split(sentence):
            part = part.strip(_TRIM + ".!?؟…")
            if not part:
                continue
            for piece in _merge_short(_COMMA.split(part)):
                clauses.extend(_merge_short(_COORD.split(piece)))
    clauses = [c for c in clauses if c]
    return (clauses or [text.strip()])[:MAX_CLAUSES]
