"""
Skill Gap Analyzer

Author : Internship Intelligence Platform

Description:
Computes the overlap between a student's skills and an
internship's required skills, identifies missing skills,
generates learning resource links and a recommendation level.
"""

from __future__ import annotations

import ast
from typing import Any

import pandas as pd

from src.utils.logger import logger


class SkillGapAnalyzer:
    """Computes skill overlap, missing skills, learning resources and match level."""

    # ---------------------------------------------------------

    @staticmethod
    def parse(skills: Any) -> list[str]:
        """Parse a skills field that may be a list, stringified list, or comma-separated string."""

        if pd.isna(skills):
            return []

        if isinstance(skills, list):
            return [str(i).strip() for i in skills if str(i).strip()]

        if isinstance(skills, str):
            try:
                parsed = ast.literal_eval(skills)
                if isinstance(parsed, list):
                    return [str(i).strip() for i in parsed if str(i).strip()]
            except Exception:
                return [i.strip() for i in skills.split(",") if i.strip()]

        return []

    # ---------------------------------------------------------

    def skill_overlap_score(
        self,
        student_skills: list[str],
        internship_skills: list[str],
    ) -> tuple[float, list[str], list[str]]:
        """
        Return (overlap_score, matched_skills, missing_skills).

        overlap_score = len(matched) / len(internship_skills)
        """

        student = {i.lower().strip() for i in student_skills}
        internship = {i.lower().strip() for i in internship_skills}

        matched = sorted(list(student & internship))
        missing = sorted(list(internship - student))

        if len(internship) == 0:
            score = 0.0
        else:
            score = round(len(matched) / len(internship), 4)

        return score, matched, missing

    # ---------------------------------------------------------

    @staticmethod
    def recommendation_level(score: float) -> str:
        """Map an overlap score to a human-readable recommendation level."""

        if score >= 0.80:
            return "Excellent Match"
        if score >= 0.60:
            return "Good Match"
        if score >= 0.40:
            return "Moderate Match"
        return "Needs Skill Improvement"

    # ---------------------------------------------------------

    @staticmethod
    def learning_resources(missing_skills: list[str]) -> dict[str, dict[str, str]]:
        """Generate YouTube / Coursera / freeCodeCamp links for each missing skill."""

        resources: dict[str, dict[str, str]] = {}

        for skill in missing_skills:
            resources[skill] = {
                "youtube": f"https://www.youtube.com/results?search_query={skill}+tutorial",
                "coursera": f"https://www.coursera.org/search?query={skill}",
                "freecodecamp": f"https://www.freecodecamp.org/news/search/?query={skill}",
            }

        return resources

    # ---------------------------------------------------------

    def skill_match_percentage(
        self,
        student_skills: list[str],
        internship_skills: list[str],
    ) -> float:
        """Return skill match as a 0-100 percentage (rounded to 1 decimal)."""

        score, _, _ = self.skill_overlap_score(student_skills, internship_skills)
        return round(score * 100, 1)
