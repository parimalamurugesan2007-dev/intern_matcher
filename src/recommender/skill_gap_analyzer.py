"""
Skill Gap Analyzer

Author:
Internship Intelligence Platform
"""

from __future__ import annotations

import ast
import pandas as pd


class SkillGapAnalyzer:

    @staticmethod
    def parse(skills):

        if pd.isna(skills):
            return []

        if isinstance(skills, list):
            return skills

        if isinstance(skills, str):

            try:

                parsed = ast.literal_eval(skills)

                if isinstance(parsed, list):
                    return [str(i).strip() for i in parsed]

            except Exception:

                return [
                    i.strip()
                    for i in skills.split(",")
                    if i.strip()
                ]

        return []

    # ---------------------------------------------------------

    def skill_overlap_score(
        self,
        student_skills,
        internship_skills
    ):

        student = {
            i.lower().strip()
            for i in student_skills
        }

        internship = {
            i.lower().strip()
            for i in internship_skills
        }

        matched = sorted(list(student & internship))

        missing = sorted(list(internship - student))

        if len(internship) == 0:
            score = 0
        else:
            score = round(
                len(matched) / len(internship),
                2
            )

        return score, matched, missing

    # ---------------------------------------------------------

    def recommendation_level(
        self,
        score
    ):

        if score >= 0.80:
            return "Excellent Match"

        if score >= 0.60:
            return "Good Match"

        if score >= 0.40:
            return "Moderate Match"

        return "Needs Skill Improvement"

    # ---------------------------------------------------------

    def learning_resources(
        self,
        missing_skills
    ):

        resources = {}

        for skill in missing_skills:

            resources[skill] = {

                "youtube":
                f"https://www.youtube.com/results?search_query={skill}+tutorial",

                "coursera":
                f"https://www.coursera.org/search?query={skill}",

                "freecodecamp":
                f"https://www.freecodecamp.org/news/search/?query={skill}"

            }

        return resources