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
    """Shared wrapper around SentenceTransformer."""

    _shared_model: Optional[SentenceTransformer] = None
    

    def __init__(
        self,
        model_name: str = settings.EMBEDDING_MODEL_NAME
    ) -> None:
        self.model_name = model_name

    # ---------------------------------------------------------
    # MODEL LOADING
    # ---------------------------------------------------------

    def load(self) -> SentenceTransformer:
        """
        Load the SentenceTransformer model only once.

        All EmbeddingModel instances reuse the same
        underlying SentenceTransformer object.
        """

        if EmbeddingModel._shared_model is None:

            logger.info("=" * 60)
            logger.info("Loading Embedding Model")
            logger.info("=" * 60)

            EmbeddingModel._shared_model = SentenceTransformer(
                self.model_name
            )

            

            logger.info(
                f"Model Loaded : {self.model_name}"
            )

        return EmbeddingModel._shared_model

    # ---------------------------------------------------------
    # EMBEDDING DIMENSION
    # ---------------------------------------------------------

    def embedding_dimension(self) -> int:
        """Return embedding dimension of the loaded model."""

        model = self.load()

        return model.get_embedding_dimension()

    # ---------------------------------------------------------
    # ENCODING
    # ---------------------------------------------------------

    def encode(
        self,
        texts,
        show_progress: bool = True
    ):
        """Generate normalized embeddings for the supplied texts."""

        model = self.load()

        return model.encode(
            texts,
            show_progress_bar=show_progress,
            convert_to_numpy=True,
            normalize_embeddings=True,
        )