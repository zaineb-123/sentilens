"""Engine registry: builds the analyzer once, thread-safe, with readiness state."""
import logging
import threading
from typing import Optional

from .config import Settings
from .errors import EngineError
from .pipeline.analyzer import Analyzer
from .pipeline.aspect_catalog import AspectCatalog

log = logging.getLogger("ai-service")


class EngineState:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.analyzer: Optional[Analyzer] = None
        self.error: Optional[str] = None
        self._load_lock = threading.Lock()
        self.infer_lock = threading.Lock()  # serialise CPU inference

    @property
    def ready(self) -> bool:
        return self.analyzer is not None

    def load(self) -> None:
        with self._load_lock:
            if self.analyzer is not None:
                return
            s = self.settings
            try:
                catalog = AspectCatalog()
                embedder = None
                if s.engine == "lexicon":
                    from .pipeline.lexicon_engines import LexiconEmotion, LexiconSentiment
                    sentiment, emotion = LexiconSentiment(), LexiconEmotion()
                else:
                    from .pipeline.transformer_engines import (
                        EmbeddingAspectMatcher, TransformersEmotion, TransformersSentiment)
                    log.info("loading sentiment model %s", s.sentiment_model)
                    sentiment = TransformersSentiment(s.sentiment_model)
                    log.info("loading emotion model %s", s.emotion_model)
                    emotion = TransformersEmotion(s.emotion_model)
                    if s.model_profile == "full":
                        log.info("loading embedding model %s", s.embedding_model)
                        embedder = EmbeddingAspectMatcher(
                            s.embedding_model, catalog.descriptions(), s.embed_match_threshold)
                self.analyzer = Analyzer(s, sentiment, emotion, catalog, embedder)
                self.error = None
                log.info("engines ready (engine=%s, profile=%s)", s.engine, s.model_profile)
            except Exception as exc:  # noqa: BLE001
                self.error = str(exc)
                log.exception("engine load failed")
                raise EngineError(f"engine load failed: {exc}") from exc

    def require(self) -> Analyzer:
        if self.analyzer is None:
            self.load()  # lazy fallback when eager loading is disabled or still failing
        return self.analyzer  # type: ignore[return-value]
