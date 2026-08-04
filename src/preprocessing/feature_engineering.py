"""
Feature Engineering

Author: AI Internship Intelligence Platform

Description:
Creates AI-ready features for recommendation and search.
"""

from __future__ import annotations

import pandas as pd

from src.utils.logger import logger


class FeatureEngineering:

    def __init__(self, dataframe: pd.DataFrame):

        self.df = dataframe.copy()

    # ---------------------------------------------------------

    @staticmethod
    def _join_list(values):

        if not isinstance(values, list):
            return ""

        return " ".join(values)

    # ---------------------------------------------------------

    @staticmethod
    def _remote_flag(value):

        if isinstance(value, list):

            text = " ".join(value).lower()

            keywords = [
                "remote",
                "work from home",
                "hybrid"
            ]

            return int(any(word in text for word in keywords))

        return 0

    # ---------------------------------------------------------

    @staticmethod
    def _stipend_bucket(value):

        if value <= 0:
            return "Unpaid"

        if value <= 5000:
            return "Low"

        if value <= 10000:
            return "Medium"

        return "High"

    # ---------------------------------------------------------

    @staticmethod
    def _duration_bucket(value):

        if value <= 2:
            return "Short"

        if value <= 4:
            return "Medium"

        return "Long"

    # ---------------------------------------------------------

    def engineer(self):

        logger.info("=" * 60)
        logger.info("Feature Engineering")
        logger.info("=" * 60)

        self.df["Skills Text"] = self.df[
            "Normalized Skills"
        ].apply(self._join_list)

        self.df["Role Skills"] = (
            self.df["Normalized Role"] +
            " " +
            self.df["Skills Text"]
        )

        self.df["Internship Text"] = (

            self.df["Normalized Role"]

            + " "

            + self.df["Skills Text"]

            + " "

            + self.df["Location"]

            + " "

            + self.df["Duration"].astype(str)

            + " "

            + self.df["Intern Type"].apply(self._join_list)

            + " "

            + self.df["Perks"].apply(self._join_list)
        )

        self.df["Is Remote"] = self.df[
            "Intern Type"
        ].apply(
            self._remote_flag
        )

        self.df["Stipend Bucket"] = self.df[
            "Average Stipend"
        ].apply(
            self._stipend_bucket
        )

        self.df["Duration Bucket"] = self.df[
            "Duration (Months)"
        ].apply(
            self._duration_bucket
        )

        logger.info("Feature Engineering Completed")

        return self.df