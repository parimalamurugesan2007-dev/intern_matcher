"""
Dataset Profiler

Generates a comprehensive profile report of the internship dataset.
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

from src.utils.logger import logger


class DatasetProfiler:

    def __init__(self, dataframe: pd.DataFrame):

        self.df = dataframe.copy()

    # --------------------------------------------------

    def basic_info(self):

        return {
            "rows": int(self.df.shape[0]),
            "columns": int(self.df.shape[1]),
            "memory_usage_mb": round(
                self.df.memory_usage(deep=True).sum() / 1024**2,
                2,
            ),
        }

    # --------------------------------------------------

    def missing_values(self):

        return (
            self.df.isna()
            .sum()
            .sort_values(ascending=False)
            .to_dict()
        )

    # --------------------------------------------------

    def duplicate_info(self):

        return {
            "duplicate_rows": int(self.df.duplicated().sum()),
            "duplicate_internship_ids": int(
                self.df["Internship Id"].duplicated().sum()
            ),
        }

    # --------------------------------------------------

    def company_statistics(self):

        companies = self.df["Company Name"]

        return {
            "unique_companies": int(companies.nunique()),
            "top_10_companies": companies.value_counts()
            .head(10)
            .to_dict(),
        }

    # --------------------------------------------------

    def role_statistics(self):

        roles = self.df["Role"]

        return {
            "unique_roles": int(roles.nunique()),
            "top_20_roles": roles.value_counts()
            .head(20)
            .to_dict(),
        }

    # --------------------------------------------------

    def location_statistics(self):

        locations = self.df["Location"]

        return {
            "unique_locations": int(locations.nunique()),
            "top_20_locations": locations.value_counts()
            .head(20)
            .to_dict(),
        }

    # --------------------------------------------------

    def stipend_statistics(self):

        stipend = self.df["Stipend"].astype(str)

        return {
            "missing": int(stipend.isna().sum()),
            "sample_values": stipend.head(10).tolist(),
        }

    # --------------------------------------------------

    def duration_statistics(self):

        duration = self.df["Duration"]

        return {
            "unique_duration": int(duration.nunique()),
            "top_duration": duration.value_counts()
            .head(10)
            .to_dict(),
        }

    # --------------------------------------------------

    def application_statistics(self):

        applications = pd.to_numeric(
            self.df["Number of Applications"],
            errors="coerce",
        )

        valid = applications.dropna()

        if valid.empty:
            return {
                "average_applications": None,
                "maximum_applications": None,
                "minimum_applications": None,
                "missing_values": len(applications),
            }

        return {
            "average_applications": round(valid.mean(), 2),
            "maximum_applications": int(valid.max()),
            "minimum_applications": int(valid.min()),
            "missing_values": int(applications.isna().sum()),
        }

    # --------------------------------------------------

    def skill_statistics(self):

        skills = (
            self.df["Skills"]
            .fillna("")
            .astype(str)
        )

        unique_skills = set()

        internship_skill_count = []

        for row in skills:

            split_skills = [
                skill.strip()
                for skill in row.split(",")
                if skill.strip()
            ]

            internship_skill_count.append(
                len(split_skills)
            )

            unique_skills.update(split_skills)

        return {
            "unique_skills": len(unique_skills),
            "average_skills_per_internship": round(
                sum(internship_skill_count)
                / len(internship_skill_count),
                2,
            ),
            "sample_skills": sorted(
                list(unique_skills)
            )[:50],
        }

    # --------------------------------------------------

    def generate_profile(self):

        logger.info("Generating Dataset Profile...")

        profile = {

            "basic_info":
                self.basic_info(),

            "missing_values":
                self.missing_values(),

            "duplicates":
                self.duplicate_info(),

            "companies":
                self.company_statistics(),

            "roles":
                self.role_statistics(),

            "locations":
                self.location_statistics(),

            "stipend":
                self.stipend_statistics(),

            "duration":
                self.duration_statistics(),

            "applications":
                self.application_statistics(),

            "skills":
                self.skill_statistics(),
        }

        return profile

    # --------------------------------------------------

    def save_profile(
        self,
        output_path="reports/dataset_profile.json",
    ):

        profile = self.generate_profile()

        output = Path(output_path)

        output.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        with open(output, "w") as file:

            json.dump(
                profile,
                file,
                indent=4,
            )

        logger.info(
            f"Profile saved at {output}"
        )

        return profile