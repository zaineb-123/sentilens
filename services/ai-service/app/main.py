import hmac
import logging
import threading
import time
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import Depends, FastAPI, Header, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .config import Settings, get_settings
from .engines import EngineState
from .errors import ApiError
from .schemas import AnalyzeRequest, AnalyzeResponse, BatchRequest, BatchResponse

TAGS = [{"name": "analysis", "description": "Sentiment, emotion, aspects, language"},
        {"name": "system", "description": "Health and model information"}]


def create_app(settings: Optional[Settings] = None) -> FastAPI:
    settings = settings or get_settings()
    logging.basicConfig(level=settings.log_level)
    state = EngineState(settings)
    started = time.time()

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        if settings.eager_load:
            def _bg():
                try:
                    state.load()
                except Exception:  # noqa: BLE001  (already logged; /health/ready reports it)
                    pass
            threading.Thread(target=_bg, daemon=True).start()
        yield

    app = FastAPI(
        title="SentiLens AI/NLP Service",
        version="1.0.0",
        description=("Internal NLP service: language detection, sentiment (incl. mixed), emotions and "
                     "aspect-based sentiment for FR / EN / AR. Analyses feedback CONTENT only; it never "
                     "profiles or diagnoses people. Tunisian Arabizi is experimental."),
        openapi_tags=TAGS,
        lifespan=lifespan,
    )
    app.state.engine_state = state

    def require_key(x_internal_key: Optional[str] = Header(default=None)):
        if settings.internal_key and not hmac.compare_digest(x_internal_key or "", settings.internal_key):
            raise ApiError(401, "UNAUTHORIZED", "invalid or missing internal key")

    @app.exception_handler(ApiError)
    async def _api_error(_: Request, exc: ApiError):
        return JSONResponse(status_code=exc.status, content={
            "error": {"code": exc.code, "message": exc.message, "details": exc.details}})

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, exc: RequestValidationError):
        details = [{"loc": list(e["loc"]), "msg": e["msg"]} for e in exc.errors()]
        return JSONResponse(status_code=422, content={
            "error": {"code": "VALIDATION_ERROR", "message": "invalid request", "details": details}})

    @app.get("/health", tags=["system"], summary="Liveness")
    def health():
        return {"status": "ok", "service": "ai-service", "uptime_s": round(time.time() - started)}

    @app.get("/health/ready", tags=["system"], summary="Readiness (models loaded)")
    def ready():
        body = {"ready": state.ready, "engine": settings.engine, "profile": settings.model_profile,
                "error": state.error}
        return JSONResponse(status_code=200 if state.ready else 503, content=body)

    @app.get("/models", tags=["system"], dependencies=[Depends(require_key)])
    def models():
        a = state.require()
        return {"engine": settings.engine, "profile": settings.model_profile, "models": a.models(),
                "languages": ["fr", "en", "ar"], "experimental": ["tunisian_arabizi", "tunisian_arabic_markers"]}

    @app.post("/analyze", response_model=AnalyzeResponse, tags=["analysis"],
              dependencies=[Depends(require_key)])
    def analyze(req: AnalyzeRequest):
        analyzer = state.require()
        with state.infer_lock:
            return analyzer.analyze(req.text, req.language_hint)

    @app.post("/analyze/batch", response_model=BatchResponse, tags=["analysis"],
              dependencies=[Depends(require_key)])
    def analyze_batch(req: BatchRequest):
        analyzer = state.require()
        t0 = time.perf_counter()
        with state.infer_lock:
            results = analyzer.analyze_many([(i.text, i.language_hint) for i in req.items])
        return {"results": [{"id": i.id, "result": r} for i, r in zip(req.items, results)],
                "count": len(results), "processing_ms": round((time.perf_counter() - t0) * 1000, 2)}

    return app


app = create_app()
