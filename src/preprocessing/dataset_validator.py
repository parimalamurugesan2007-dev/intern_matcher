"""
Dataset Validator

Author: AI Internship Intelligence Platform

Description:
Validates the internship dataset after it has been loaded.
"""

from typing import Dict

import pandas as pd

from src.preprocessing.constants import (
    REQUIRED_COLUMNS,
    CRITICAL_COLUMNS,
)

from src.utils.logger import logger


class DatasetValidator:

    """
    Validates internship dataset.
    """

    def __init__(self, dataframe: pd.DataFrame):

        self.df = dataframe

    # --------------------------------------------------------

    def validate_required_columns(self):

        logger.info("Validating Required Columns...")

        missing_columns = [
            column
            for column in REQUIRED_COLUMNS
            if column not in self.df.columns
        ]

        if missing_columns:

            raise ValueError(
                f"Missing Columns : {missing_columns}"
            )

        logger.info("Required Column Validation Passed")

    # --------------------------------------------------------

    def validate_empty_dataset(self):

        logger.info("Checking Empty Dataset...")

        if self.df.empty:

            raise ValueError("Dataset is Empty.")

        logger.info("Dataset is Valid")

    # --------------------------------------------------------

    def validate_missing_values(self):

        logger.info("Checking Missing Values...")

        report = {}

        for column in CRITICAL_COLUMNS:

            report[column] = int(
                self.df[column].isna().sum()
            )

        return report

    # --------------------------------------------------------

    def validate_duplicates(self):

        logger.info("Checking Duplicates...")

        return {

            "duplicate_rows": int(
                self.df.duplicated().sum()
            ),

            "duplicate_internship_ids": int(
                self.df[
                    "Internship Id"
                ].duplicated().sum()
            )
        }

    # --------------------------------------------------------

    def dataset_summary(self):

        logger.info("Generating Dataset Summary...")

        summary = {

            "rows": int(len(self.df)),

            "columns": int(len(self.df.columns)),

            "unique_companies": int(
                self.df[
                    "Company Name"
                ].nunique()
            ),

            "unique_roles": int(
                self.df[
                    "Role"
                ].nunique()
            ),

            "unique_locations": int(
                self.df[
                    "Location"
                ].nunique()
            ),
        }

        return summary

    # --------------------------------------------------------

    def run(self) -> Dict:

        logger.info("=" * 60)
        logger.info("Running Dataset Validation")
        logger.info("=" * 60)

        self.validate_empty_dataset()

        self.validate_required_columns()

        report = {

            "summary":
                self.dataset_summary(),

            "missing_values":
                self.validate_missing_values(),

            "duplicates":
                self.validate_duplicates()
        }

        logger.info("Validation Completed Successfully")

        return report