FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.ml.txt .

# CPU-only PyTorch
RUN pip install --no-cache-dir \
    torch \
    --index-url https://download.pytorch.org/whl/cpu

# Remaining ML dependencies
RUN pip install --no-cache-dir -r requirements.ml.txt

COPY src ./src
COPY data ./data
COPY ml_service ./ml_service

RUN mkdir -p logs

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8000}/health').read()" || exit 1

CMD ["sh", "-c", "uvicorn ml_service.app:app --host 0.0.0.0 --port ${PORT:-8000}"]