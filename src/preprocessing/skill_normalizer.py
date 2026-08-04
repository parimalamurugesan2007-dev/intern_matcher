"""
Skill Normalizer

Author: AI Internship Intelligence Platform

Description:
Normalizes internship skills into a consistent format.
"""

from __future__ import annotations

import re
import pandas as pd

from src.utils.logger import logger


class SkillNormalizer:

    def __init__(self, dataframe: pd.DataFrame):
        self.df = dataframe.copy()

    # -------------------------------------------------------------

    @staticmethod
    def _normalize_skill(skill: str) -> str:

        if pd.isna(skill):
            return ""

        skill = str(skill).strip().lower()

        # Remove unwanted symbols
        skill = re.sub(r"[^\w\s+#./-]", "", skill)

        # Replace multiple spaces
        skill = " ".join(skill.split())

        # Common abbreviations
        mapping = {
            "ml": "Machine Learning",
            "ai": "Artificial Intelligence",
            "dl": "Deep Learning",
            "nlp": "Natural Language Processing",
            "cv": "Computer Vision",
            "js": "JavaScript",
            "ts": "TypeScript",
            "sql": "SQL",
            "dbms": "DBMS",
            "oops": "OOPS",
            "html": "HTML",
            "css": "CSS",
            "api": "API",
            "aws": "AWS",
            "gcp": "GCP",
        }

        if skill in mapping:
            return mapping[skill]

        return skill.title()

    # -------------------------------------------------------------

    def normalize(self):

        logger.info("=" * 60)
        logger.info("Normalizing Skills")
        logger.info("=" * 60)

        normalized_skills = []

        for skills in self.df["Skills"]:

            current = []

            if isinstance(skills, list):

                for skill in skills:

                    cleaned = self._normalize_skill(skill)

                    if cleaned:
                        current.append(cleaned)

            current = sorted(set(current))

            normalized_skills.append(current)

        self.df["Normalized Skills"] = normalized_skills

        logger.info("Skill Normalization Completed")

        return self.df