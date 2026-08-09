# Internship Intelligence Platform — Backend
#
# Build:
#   docker build -t internship-matcher .
#
# Run:
#   docker run -p 8000:8000 internship-matcher
#
# No secrets are baked into this image. Runtime configuration
# (dataset/model paths, MLflow tracking URI, CORS origins) is
# read from environment variables — pass them with `-e` or an
# env file at `docker run` time, e.g.:
#   docker run -p 8000:8000 \
#     -e INTERN_MATCHER_MLFLOW_TRACKING_URI=... \
#     internship-matcher

FROM python:3.12-slim

WORKDIR /app

# System dependencies needed by PyMuPDF (fitz) and scientific Python libs.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first for better layer caching.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source, trained model artifacts, and data needed at runtime.
# NOTE: If your training dataset / large embeddings are managed with DVC,
# run `dvc pull` (with a configured remote) either in a build stage or
# before `docker build`, so the files below actually exist in the context.
COPY src ./src
COPY data ./data

# Model artifacts (best_model.pkl, vectorizer.pkl, label_encoder.pkl, embeddings)
# already live under src/models/saved and are copied by `COPY src ./src` above.

RUN mkdir -p logs

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

# Basic container-level health check hitting our /health endpoint.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()" || exit 1

CMD ["uvicorn", "src.api.app:app", "--host", "0.0.0.0", "--port", "8000"]
