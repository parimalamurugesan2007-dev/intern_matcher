"""
Dataset Loader

Author: AI Internship Intelligence Platform

Description:
Loads the internship dataset from disk and performs
basic integrity checks before returning a pandas DataFrame.
"""

from pathlib import Path

import pandas as pd

from src.utils.logger import logger


class DatasetLoader:
    """
    Loads internship dataset.
    """

    def __init__(self, dataset_path: str):

        self.dataset_path = Path(dataset_path)

    def load(self) -> pd.DataFrame:

        logger.info("=" * 60)
        logger.info("Loading Internship Dataset")
        logger.info("=" * 60)

        if not self.dataset_path.exists():

            raise FileNotFoundError(
                f"Dataset not found:\n{self.dataset_path}"
            )

        if self.dataset_path.suffix.lower() != ".csv":

            raise ValueError(
                "Dataset must be a CSV file."
            )

        try:

            dataframe = pd.read_csv(self.dataset_path)

        except Exception as error:

            raise RuntimeError(
                f"Unable to read dataset.\n{error}"
            )

        if dataframe.empty:

            raise ValueError(
                "Dataset is empty."
            )

        logger.info(
            f"Dataset Loaded Successfully"
        )

        logger.info(
            f"Rows    : {len(dataframe)}"
        )

        logger.info(
            f"Columns : {len(dataframe.columns)}"
        )

        return dataframe