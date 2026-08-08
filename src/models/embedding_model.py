"""
Embedding Model Manager

Author : Internship Intelligence Platform

Description:
Loads and manages the SentenceTransformer model used
throughout the recommendation engine.

The model is loaded exactly once and reused for every request.
"""

from __future__ import annotations

from typing import Optional

from sentence_transformers import SentenceTransformer

from src.config.settings import settings
from src.utils.logger import logger


class EmbeddingModel:
    """Thin wrapper around SentenceTransformer with lazy, one-time loading."""

    _shared_model: Optional[SentenceTransformer] = None

    def __init__(self, model_name: str = settings.EMBEDDING_MODEL_NAME) -> None:
        self.model_name = model_name
        self.model: Optional[SentenceTransformer] = None

    # ---------------------------------------------------------

    def load(self) -> SentenceTransformer:
        """Load the model once (per instance) and cache it."""

        if self.model is None:
            logger.info("=" * 60)
            logger.info("Loading Embedding Model")
            logger.info("=" * 60)

            self.model = SentenceTransformer(self.model_name)

            logger.info(f"Model Loaded : {self.model_name}")

        return self.model

    # ---------------------------------------------------------

    def embedding_dimension(self) -> int:
        model = self.load()
        return model.get_embedding_dimension()

    # ---------------------------------------------------------

    def encode(self, texts, show_progress: bool = True):
        model = self.load()
        return model.encode(
            texts,
            show_progress_bar=show_progress,
            convert_to_numpy=True,
            normalize_embeddings=True,
        )
