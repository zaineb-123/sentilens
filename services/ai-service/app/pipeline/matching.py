import re

from .text_utils import ar_token_matches, has_arabic, normalize


class TermSet:
    """Multilingual term matcher.

    Latin single words: prefix match (handles plurals/inflections); a trailing '!' means whole word.
    Multi-word terms: phrase match. Arabic single words: clitic-aware token match
    (so 'احب' does not fire inside 'احباط').
    """

    def __init__(self, terms: list[str], ar_allow: int = 1):
        self.ar_allow = ar_allow
        self.latin: list[tuple[str, bool]] = []
        self.ar_words: list[str] = []
        self.ar_phrases: list[str] = []
        latin_phrases: list[str] = []
        for raw in terms:
            whole = raw.endswith("!")
            term = normalize(raw.rstrip("!"))
            if not term:
                continue
            multi = " " in term
            if has_arabic(term):
                (self.ar_phrases if multi else self.ar_words).append(term)
            elif multi:
                latin_phrases.append(re.escape(term))
            else:
                self.latin.append((term, whole))
        self._phrase_re = (
            re.compile(r"(?<![^\W_])(?:%s)" % "|".join(latin_phrases)) if latin_phrases else None
        )

    def token_match(self, tok: str) -> bool:
        if has_arabic(tok):
            return any(ar_token_matches(tok, t, self.ar_allow) for t in self.ar_words)
        for term, whole in self.latin:
            if (tok == term) if whole else tok.startswith(term):
                return True
        return False

    def token_hits(self, tokens: list[str]) -> list[int]:
        return [i for i, t in enumerate(tokens) if self.token_match(t)]

    def phrase_count(self, text: str) -> int:
        n = len(self._phrase_re.findall(text)) if self._phrase_re else 0
        return n + sum(1 for p in self.ar_phrases if p in text)

    def matches(self, text: str, tokens: list[str]) -> bool:
        return bool(self.token_hits(tokens)) or self.phrase_count(text) > 0
