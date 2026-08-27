"""
Centralized Configuration

Author : Internship Intelligence Platform

Description:
All file paths and tunable constants live here so every service
reads from a single source of truth.
"""

from __future__ import annotations

from pathlib import Path


class Settings:
    """Project-wide configuration.  All paths are relative to the project root."""

    # ------------------------------------------------------------------
    # Data paths
    # ------------------------------------------------------------------
    DATASET_PATH: str = "data/final/training_dataset_domain.csv"

    EMBEDDING_PATH: str = "data/embeddings/internship_embeddings.npy"
    EMBEDDING_INDEX_PATH: str = "data/embeddings/internship_index.csv"

    SKILLS_DICTIONARY_PATH: str = "data/knowledge/skills.json"
    DOMAIN_MAPPING_PATH: str = "src/preprocessing/domain_mapping.json"

    MODEL_DIR: str = "src/models/saved"
    BEST_MODEL_PATH: str = "src/models/saved/best_model.pkl"
    VECTORIZER_PATH: str = "src/models/saved/vectorizer.pkl"
    LABEL_ENCODER_PATH: str = "src/models/saved/label_encoder.pkl"

    # ------------------------------------------------------------------
    # Embedding model
    # ------------------------------------------------------------------
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"

    # ------------------------------------------------------------------
    # Recommendation weights  (must sum to 1.0)
    # ------------------------------------------------------------------
    SEMANTIC_WEIGHT: float = 0.40
    SKILL_WEIGHT: float = 0.40
    DOMAIN_WEIGHT: float = 0.20

    # ------------------------------------------------------------------
    # Domain prediction
    # ------------------------------------------------------------------
    TOP_K_DOMAINS: int = 5

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",   # vite dev server
        "http://localhost:4173",   # vite preview (production build served locally)
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
        "http://127.0.0.1:3000",
    ]

    # ------------------------------------------------------------------
    # MLflow
    # ------------------------------------------------------------------
    MLFLOW_TRACKING_URI: str = "sqlite:///mlflow.db"
    MLFLOW_EXPERIMENT_NAME: str = "Internship Intelligence Platform"

    # ------------------------------------------------------------------
    # Model metadata
    # ------------------------------------------------------------------
    MODEL_METADATA_PATH: str = "src/models/saved/model_metadata.json"

    # ------------------------------------------------------------------
    # Search
    # ------------------------------------------------------------------
    DEFAULT_SEARCH_LIMIT: int = 50
    DEFAULT_DOMAIN_RESULTS: int = 10
    DEFAULT_RECOMMEND_TOP_K: int = 10


def _load_env_overrides(cfg: "Settings") -> "Settings":
    """Allow key paths/settings to be overridden via environment variables."""

    import os

    env_map = {
        "DATASET_PATH": "DATASET_PATH",
        "EMBEDDING_PATH": "EMBEDDING_PATH",
        "EMBEDDING_INDEX_PATH": "EMBEDDING_INDEX_PATH",
        "MODEL_DIR": "MODEL_DIR",
        "MLFLOW_TRACKING_URI": "MLFLOW_TRACKING_URI",
        "MLFLOW_EXPERIMENT_NAME": "MLFLOW_EXPERIMENT_NAME",
    }

    for attr, env_var in env_map.items():
        value = os.environ.get(f"INTERN_MATCHER_{env_var}")
        if value:
            setattr(cfg, attr, value)

    return cfg


settings = _load_env_overrides(Settings())
