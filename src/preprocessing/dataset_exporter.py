"""
Dataset Exporter

Author: AI Internship Intelligence Platform

Description:
Exports the processed dataset for downstream AI modules.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from src.utils.logger import logger


class DatasetExporter:

    def __init__(
        self,
        dataframe: pd.DataFrame,
        output_path: str = "data/processed/internships_processed.csv"
    ):

        self.df = dataframe
        self.output_path = Path(output_path)

    # -------------------------------------------------------------

    def export(self):

        logger.info("=" * 60)
        logger.info("Exporting Processed Dataset")
        logger.info("=" * 60)

        # Create folder if it does not exist
        self.output_path.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        # Save dataset
        self.df.to_csv(
            self.output_path,
            index=False
        )

        logger.info(
            f"Dataset exported successfully -> {self.output_path}"
        )

        logger.info(
            f"Rows    : {len(self.df)}"
        )

        logger.info(
            f"Columns : {len(self.df.columns)}"
        )

        return str(self.output_path)