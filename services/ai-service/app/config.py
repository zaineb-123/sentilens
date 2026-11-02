from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All configuration comes from environment variables prefixed with AI_."""

    model_config = SettingsConfigDict(env_prefix="AI_", extra="ignore")

    # transformers = real pretrained models (default, used in Docker)
    # lexicon      = lightweight rule-based engine for offline dev / unit tests ONLY
    engine: Literal["transformers", "lexicon"] = "transformers"
    # light = sentiment + emotion models; full = also multilingual embeddings for aspect matching
    model_profile: Literal["light", "full"] = "light"

    sentiment_model: str = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
    emotion_model: str = "MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7"
    embedding_model: str = "intfloat/multilingual-e5-small"
    # Cosine threshold for embedding-based aspect matching. NOT calibrated yet: tune on real data.
    embed_match_threshold: float = 0.86

    max_text_length: int = 5000
    max_batch_size: int = 100
    # A clause counts as clearly positive/negative (for the "mixed" rule) above this confidence.
    confident_threshold: float = 0.55
    # Confidence multiplier applied to experimental input (Tunisian Arabizi).
    experimental_confidence_factor: float = 0.7

    eager_load: bool = True
    internal_key: str = ""  # if set, requests must send X-Internal-Key
    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    return Settings()
