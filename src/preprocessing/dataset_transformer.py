"""
Dataset Transformer

Author: AI Internship Intelligence Platform

Description:
Transforms raw internship dataset into proper Python data types.
"""

from __future__ import annotations

import ast
import re

import pandas as pd

from src.utils.logger import logger


class DatasetTransformer:

    def __init__(self, dataframe: pd.DataFrame):

        self.df = dataframe.copy()

    # -------------------------------------------------------------

    @staticmethod
    def _safe_list(value):

        if pd.isna(value):
            return []

        if isinstance(value, list):
            return value

        try:
            parsed = ast.literal_eval(value)

            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed]

            return []

        except Exception:
            return []

    # -------------------------------------------------------------

    @staticmethod
    def _safe_location(value):

        if pd.isna(value):
            return ""

        try:

            parsed = ast.literal_eval(value)

            if isinstance(parsed, tuple):

                return ", ".join(
                    str(item).strip()
                    for item in parsed
                )

            return str(parsed)

        except Exception:

            return str(value).strip()

    # -------------------------------------------------------------

    @staticmethod
    def _extract_number(value):

        if pd.isna(value):
            return 0

        match = re.search(r"\d+", str(value).replace(",", ""))

        if match:
            return int(match.group())

        return 0

    # -------------------------------------------------------------

    @staticmethod
    def _parse_stipend(value):

        if pd.isna(value):

            return {
                "minimum": 0,
                "maximum": 0,
                "average": 0
            }

        numbers = re.findall(
            r"\d[\d,]*",
            str(value)
        )

        numbers = [
            int(number.replace(",", ""))
            for number in numbers
        ]

        if len(numbers) == 0:

            return {
                "minimum": 0,
                "maximum": 0,
                "average": 0
            }

        if len(numbers) == 1:

            return {
                "minimum": numbers[0],
                "maximum": numbers[0],
                "average": numbers[0]
            }

        return {

            "minimum": numbers[0],

            "maximum": numbers[1],

            "average": int(
                (numbers[0] + numbers[1]) / 2
            )
        }

    # -------------------------------------------------------------

    @staticmethod
    def _duration_months(value):

        if pd.isna(value):
            return 0

        match = re.search(
            r"\d+",
            str(value)
        )

        if match:
            return int(match.group())

        return 0

    # -------------------------------------------------------------

    def transform(self):

        logger.info("=" * 60)
        logger.info("Transforming Dataset")
        logger.info("=" * 60)

        self.df["Skills"] = self.df["Skills"].apply(
            self._safe_list
        )

        self.df["Perks"] = self.df["Perks"].apply(
            self._safe_list
        )

        self.df["Intern Type"] = self.df[
            "Intern Type"
        ].apply(
            self._safe_list
        )

        self.df["Location"] = self.df[
            "Location"
        ].apply(
            self._safe_location
        )

        self.df["Applications"] = self.df[
            "Number of Applications"
        ].apply(
            self._extract_number
        )

        self.df["Opening"] = self.df[
            "Opening"
        ].fillna(0).astype(int)

        self.df["Hired Candidate"] = self.df[
             "Hired Candidate"
        ].apply(self._extract_number)

        self.df["Duration (Months)"] = self.df[
            "Duration"
        ].apply(
            self._duration_months
        )

        stipend = self.df[
            "Stipend"
        ].apply(
            self._parse_stipend
        )

        self.df["Minimum Stipend"] = stipend.apply(
            lambda x: x["minimum"]
        )

        self.df["Maximum Stipend"] = stipend.apply(
            lambda x: x["maximum"]
        )

        self.df["Average Stipend"] = stipend.apply(
            lambda x: x["average"]
        )

        logger.info("Dataset Transformation Completed")

        return self.df