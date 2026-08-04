"""
Build Internship Embeddings
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from pathlib import Path

from src.models.embedding_model import EmbeddingModel
from src.utils.logger import logger


class EmbeddingBuilder:

    def __init__(self):

        self.dataset_path = Path(
            "data/final/training_dataset_domain.csv"
        )

        self.embedding_path = Path(
            "data/embeddings/internship_embeddings.npy"
        )

        self.index_path = Path(
            "data/embeddings/internship_index.csv"
        )

        self.embedding_model = EmbeddingModel()

    # -----------------------------------------------------

    def run(self):

        logger.info("=" * 60)
        logger.info("Loading Dataset")
        logger.info("=" * 60)

        df = pd.read_csv(self.dataset_path)

        texts = df["Internship Text"].fillna("").tolist()

        logger.info(
            f"Generating {len(texts)} embeddings..."
        )

        embeddings = self.embedding_model.encode(
            texts,
            show_progress=True
        )

        # -------------------------
        # Save embeddings
        # -------------------------

        self.embedding_path.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        np.save(
            self.embedding_path,
            embeddings
        )

        # -------------------------
        # Save index
        # -------------------------

        index_df = df.reset_index()[["index"]]

        index_df.to_csv(
            self.index_path,
            index=False
        )

        logger.info("=" * 60)
        logger.info("Embeddings Saved")
        logger.info("=" * 60)

        logger.info(f"Embedding Shape : {embeddings.shape}")
        logger.info(f"Index Shape : {index_df.shape}")


if __name__ == "__main__":

    EmbeddingBuilder().run()