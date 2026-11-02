from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

from .config import get_settings

Polarity = Literal["positive", "neutral", "negative"]
Sentiment = Literal["positive", "neutral", "negative", "mixed"]
LanguageCode = Literal["fr", "en", "ar"]


def _check_text(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError("text must not be blank")
    if len(value) > get_settings().max_text_length:
        raise ValueError(f"text exceeds {get_settings().max_text_length} characters")
    return value


class AnalyzeRequest(BaseModel):
    text: str
    language_hint: Optional[LanguageCode] = Field(
        default=None, description="Used only when automatic detection is inconclusive."
    )
    _v = field_validator("text")(_check_text)


class BatchItem(BaseModel):
    id: str = Field(min_length=1, max_length=100)
    text: str
    language_hint: Optional[LanguageCode] = None
    _v = field_validator("text")(_check_text)


class BatchRequest(BaseModel):
    items: list[BatchItem] = Field(min_length=1)

    @field_validator("items")
    @classmethod
    def _limit(cls, v):
        limit = get_settings().max_batch_size
        if len(v) > limit:
            raise ValueError(f"batch exceeds {limit} items")
        return v


class LanguageInfo(BaseModel):
    code: Literal["fr", "en", "ar", "und"]
    script: Literal["latin", "arabic", "mixed", "none"]
    confidence: float
    dialect: Optional[Literal["tunisian_arabizi", "tunisian_arabic_markers"]] = None
    experimental: bool = False


class SentimentScores(BaseModel):
    positive: float
    neutral: float
    negative: float


class SentimentResult(BaseModel):
    label: Sentiment
    confidence: float
    scores: SentimentScores


class EmotionScore(BaseModel):
    label: str
    score: float


class EmotionResult(BaseModel):
    primary: str
    scores: list[EmotionScore]


class AspectResult(BaseModel):
    key: str
    label: dict[str, str]
    type: Literal["fixed", "emergent"]
    sentiment: Sentiment
    confidence: float
    mentions: int


class Meta(BaseModel):
    engine: str
    models: dict[str, Optional[str]]
    clauses: int
    processing_ms: float
    warnings: list[str] = []


class AnalyzeResponse(BaseModel):
    language: LanguageInfo
    sentiment: SentimentResult
    emotions: EmotionResult
    aspects: list[AspectResult]
    meta: Meta


class BatchResult(BaseModel):
    id: str
    result: AnalyzeResponse


class BatchResponse(BaseModel):
    results: list[BatchResult]
    count: int
    processing_ms: float
