"""Rule-based FALLBACK engines (dev / unit tests / offline).

They are NOT the production models. The default engine is `transformers`
(see transformer_engines.py). Responses always report which engine produced them.
"""
from .matching import TermSet
from .text_utils import normalize, tokenize

EMOTIONS = ["joy", "satisfaction", "frustration", "anger", "sadness", "fear", "surprise", "neutral"]


def _t(s: str) -> list[str]:
    return [x for x in s.split("|") if x]


POS = TermSet(_t(
    "good|great|excellent|love|enjoy|happy|satisf|amazing|wonderful|fantastic|support|helpful|friendly|"
    "motivat|appreci|fair!|comfortable|flexib|clear|positive|proud|thank|best|nice|pleasant|rewarding|"
    "recommend|bon!|bonne|super|genial|aime|adore|content|heureux|agreable|sympa|juste!|confortable|"
    "clair|positif|fier|merci|meilleur|top!|epanou|bienveillant|soutien|ravi|utile|bien!|"
    "behi|mrigel|zwin|bravo|"
    "جيد|ممتاز|رائع|احب|سعيد|سعادة|راض|مرتاح|ممتع|مفيد|متعاون|داعم|محفز|شكرا|افضل|جميل|مريح|مرن|"
    "واضح|فخور|عادل"))
NEG = TermSet(_t(
    "bad!|poor!|terrible|awful|hate|unhappy|frustrat|stress|overwork|exhaust|tired|lack|unfair|unclear|"
    "slow|toxic|ignor|underpaid|difficult|hard!|problem|issue|worse|worst|disappoint|angry|annoy|useless|"
    "outdated|chaos|pressure|insufficient|disorgani|micromanag|delay|heavy|overload|understaff|"
    "mauvais|mal!|horrible|deteste|malheureux|surcharge|epuis|fatigu|manque|injuste|flou|lent!|lente|"
    "toxique|difficile|probleme|pire|decu|colere|enerv|inutile|obsolete|pression|insuffisan|desorganis|"
    "retard|trop!|mochkla|khayeb|ta3ab|3atal|"
    "سيء|سيئ|ضعيف|فظيع|اكره|محبط|احباط|ضغط|ضغوط|تعب|متعب|ارهاق|مرهق|نقص|ظلم|غامض|بطيء|سام|تجاهل|"
    "صعب|مشكلة|مشاكل|اسوا|خيبة|غضب|مزعج|فوضى|اهمال|مبالغ"))
NEG_PHRASES = TermSet(_t(
    "too high|too much|too many|too long|too heavy|too little|not enough|no recognition|no support|"
    "low pay|pas assez|pas de reconnaissance|pas de soutien|lack of|manque de|mouch behi"))
NEGATION = {
    "not", "no", "never", "without", "hardly", "pas", "jamais", "sans", "aucun", "aucune", "ni",
    "لا", "ليس", "ليست", "لم", "لن", "ما", "مش", "غير", "مانيش", "ماهوش", "mouch", "mesh",
}

_EMO = {
    "joy": _t("happy|joy|love|enjoy|excit|thrill|heureux|joie|adore|ravi|سعيد|فرح|سعادة|bravo"),
    "satisfaction": _t("satisf|pleased|proud|fulfil|comfortable|rewarding|content|fier|epanou|"
                       "راض|مرتاح|فخور|behi|mrigel"),
    "frustration": _t("frustr|stuck|ignor|unclear|overload|exhaust|tired|overwork|slow|pressure|"
                      "surcharge|epuis|fatigu|bloqu|manque|lack|محبط|احباط|ضغط|تعب|مرهق|ارهاق|mochkla|ta3ab"),
    "anger": _t("angry|furious|unfair|hate|outrag|toxic|injust|colere|furieux|enerv|deteste|"
                "غضب|ظلم|غاضب|اكره"),
    "sadness": _t("sad|unhappy|disappoint|demotivat|lonely|triste|decu|malheureux|حزين|خيبة"),
    "fear": _t("afraid|fear|worried|anxious|scared|layoff|redundan|peur|inquiet|craint|licenci|"
               "خوف|قلق|خايف|تسريح"),
    "surprise": _t("surpris|unexpected|shocked|suddenly|etonn|inattendu|soudain|مفاجئ|صدمة"),
}
_EMO_SETS = {k: TermSet(v) for k, v in _EMO.items()}


def _hit_polarity(ts: TermSet, tokens: list[str]) -> list[bool]:
    """For each hit, True if it is negated (negation word within the 3 previous tokens)."""
    flags = []
    for i in ts.token_hits(tokens):
        flags.append(any(t in NEGATION for t in tokens[max(0, i - 3): i]))
    return flags


def is_polar_token(tok: str) -> bool:
    return POS.token_match(tok) or NEG.token_match(tok)


class LexiconSentiment:
    name = "lexicon-sentiment"

    def predict(self, texts: list[str]) -> list[dict[str, float]]:
        out = []
        for text in texts:
            norm = normalize(text)
            tokens = tokenize(norm)
            pos = neg = 0
            for negated in _hit_polarity(POS, tokens):
                neg, pos = (neg + 1, pos) if negated else (neg, pos + 1)
            for negated in _hit_polarity(NEG, tokens):
                pos, neg = (pos + 1, neg) if negated else (pos, neg + 1)
            neg += NEG_PHRASES.phrase_count(norm)
            total = pos + neg
            if total == 0:
                out.append({"positive": 0.1, "neutral": 0.8, "negative": 0.1})
                continue
            strength = min(0.92, 0.6 + 0.12 * total)
            out.append({
                "positive": strength * pos / total,
                "neutral": 1 - strength,
                "negative": strength * neg / total,
            })
        return out


class LexiconEmotion:
    name = "lexicon-emotion"

    def predict(self, texts: list[str]) -> list[dict[str, float]]:
        out = []
        for text in texts:
            norm = normalize(text)
            tokens = tokenize(norm)
            counts = {e: len(ts.token_hits(tokens)) for e, ts in _EMO_SETS.items()}
            total = sum(counts.values())
            if total == 0:
                out.append({e: (0.86 if e == "neutral" else 0.02) for e in EMOTIONS})
                continue
            w = min(0.9, 0.55 + 0.1 * total)
            scores = {e: w * counts.get(e, 0) / total for e in EMOTIONS if e != "neutral"}
            scores["neutral"] = 1 - w
            out.append(scores)
        return out
