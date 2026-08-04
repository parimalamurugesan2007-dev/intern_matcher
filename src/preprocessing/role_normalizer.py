"""
Role Normalizer

Author: AI Internship Intelligence Platform

Description:
Creates a normalized role name from the raw internship role.
"""

from __future__ import annotations

import re

import pandas as pd

from src.utils.logger import logger


class RoleNormalizer:

    def __init__(self, dataframe: pd.DataFrame):

        self.df = dataframe.copy()

    # -------------------------------------------------------------

    @staticmethod
    def _normalize(role: str) -> str:

        if pd.isna(role):
            return "Unknown"

        role = str(role).lower()

        # Remove text inside brackets
        role = re.sub(r"\(.*?\)", "", role)

        # Remove common internship words
        remove_words = [
            "internship",
            "intern",
            "trainee",
            "program",
            "programme",
        ]

        for word in remove_words:
            role = role.replace(word, "")

        # Remove special characters
        role = re.sub(r"[^a-zA-Z0-9 ]", " ", role)

        # Remove extra spaces
        role = " ".join(role.split())

        if role == "":
            return "Unknown"

        # Title Case
        return role.title()

    # -------------------------------------------------------------

    def normalize(self):

        logger.info("=" * 60)
        logger.info("Normalizing Roles")
        logger.info("=" * 60)

        self.df["Normalized Role"] = self.df["Role"].apply(
            self._normalize
        )

        logger.info("Role Normalization Completed")

        return self.df