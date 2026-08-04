"""
Embedding Model Manager

Author : Internship Intelligence Platform

Description:
Loads and manages the SentenceTransformer model used
throughout the recommendation engine.
"""

from sentence_transformers import SentenceTransformer
from src.utils.logger import logger


class EmbeddingModel:

    def __init__(
        self,
        model_name: str = "all-MiniLM-L6-v2"
    ):

        self.model_name = model_name
        self.model = None

    # ---------------------------------------------------------

    def load(self):

        if self.model is None:

            logger.info("=" * 60)
            logger.info("Loading Embedding Model")
            logger.info("=" * 60)

            self.model = SentenceTransformer(
                self.model_name
            )

            logger.info(
                f"Model Loaded : {self.model_name}"
            )

        return self.model

    # ---------------------------------------------------------

    def embedding_dimension(self):

        model = self.load()

        return model.get_embedding_dimension()

    # ---------------------------------------------------------

    def encode(
        self,
        texts,
        show_progress=True
    ):

        model = self.load()

        return model.encode(
            texts,
            show_progress_bar=show_progress,
            convert_to_numpy=True,
            normalize_embeddings=True
        )