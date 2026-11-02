FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 HF_HOME=/models PIP_NO_CACHE_DIR=1
WORKDIR /srv

# CPU-only torch keeps the image far smaller than the default CUDA build
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app ./app

# Bake the pretrained models into the image so the first request is not slow
ARG PRELOAD_MODELS=true
ARG AI_MODEL_PROFILE=light
RUN if [ "$PRELOAD_MODELS" = "true" ]; then AI_ENGINE=transformers AI_MODEL_PROFILE=$AI_MODEL_PROFILE python -m app.download_models; fi

RUN useradd --create-home appuser && mkdir -p /models && chown -R appuser /models
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=5s --start-period=240s --retries=10 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health/ready').status==200 else 1)"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
