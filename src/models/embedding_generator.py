"""
Embedding Generator

Author: Internship Intelligence Platform

Description:
Generates vector embeddings for every internship and
stores them for semantic search.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd

from src.models.embedding_model import EmbeddingModel
from src.models.text_builder import InternshipTextBuilder
from src.utils.logger import logger


class EmbeddingGenerator:

    def __init__(
        self,
        dataset_path="data/processed/internships_processed.csv",
        output_dir="data/embeddings"
    ):

        self.dataset_path = Path(dataset_path)
        self.output_dir = Path(output_dir)

        self.output_dir.mkdir(
            parents=True,
            exist_ok=True
        )

    # -----------------------------------------------------

    def generate(self):

        logger.info("=" * 60)
        logger.info("Generating Internship Embeddings")
        logger.info("=" * 60)

        df = pd.read_csv(self.dataset_path)

        builder = InternshipTextBuilder(df)

        df = builder.build_text()

        texts = df["Internship Text"].tolist()

        model = EmbeddingModel()

        embeddings = model.encode(texts)

        np.save(
            self.output_dir / "internship_embeddings.npy",
            embeddings
        )

        np.save(
            self.output_dir / "internship_ids.npy",
            df["Internship Id"].values
        )

        metadata = {
            "model": model.model_name,
            "dimension": int(model.embedding_dimension()),
            "records": len(df)
        }

        with open(
            self.output_dir / "embedding_metadata.json",
            "w"
        ) as f:

            json.dump(
                metadata,
                f,
                indent=4
            )

        logger.info("Embeddings Generated Successfully")

        logger.info(f"Records : {len(df)}")

        logger.info(f"Dimension : {metadata['dimension']}")

        logger.info(
            f"Saved -> {self.output_dir}"
        )

        return embeddings