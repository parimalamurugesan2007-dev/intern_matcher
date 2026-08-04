"""
Data Cleaner

Author: AI Internship Intelligence Platform

Description:
Cleans the transformed internship dataset.
"""

from __future__ import annotations

import pandas as pd

from src.utils.logger import logger


class DataCleaner:

    def __init__(self, dataframe: pd.DataFrame):

        self.df = dataframe.copy()

    # ----------------------------------------------------------

    @staticmethod
    def _clean_text(value):

        if pd.isna(value):
            return ""

        return " ".join(str(value).strip().split())

    # ----------------------------------------------------------

    def clean_company_name(self):

        logger.info("Cleaning Company Names...")

        self.df["Company Name"] = self.df["Company Name"].apply(
            self._clean_text
        )

    # ----------------------------------------------------------

    def clean_role(self):

        logger.info("Cleaning Roles...")

        self.df["Role"] = self.df["Role"].apply(
            self._clean_text
        )

    # ----------------------------------------------------------

    def clean_location(self):

        logger.info("Cleaning Locations...")

        self.df["Location"] = self.df["Location"].apply(
            self._clean_text
        )

    # ----------------------------------------------------------

    def clean_skills(self):

        logger.info("Cleaning Skills...")

        self.df["Skills"] = self.df["Skills"].apply(
            lambda skills: sorted(
                {
                    self._clean_text(skill)
                    for skill in skills
                    if self._clean_text(skill)
                }
            )
        )

    # ----------------------------------------------------------

    def clean_perks(self):

        logger.info("Cleaning Perks...")

        self.df["Perks"] = self.df["Perks"].apply(
            lambda perks: sorted(
                {
                    self._clean_text(perk)
                    for perk in perks
                    if self._clean_text(perk)
                }
            )
        )

    # ----------------------------------------------------------

    def fill_missing_values(self):

        logger.info("Handling Missing Values...")

        self.df["Skills"] = self.df["Skills"].apply(
            lambda skills: skills if len(skills) > 0 else ["Unknown"]
        )

        self.df["Hired Candidate"] = self.df[
            "Hired Candidate"
        ].fillna(0)

    # ----------------------------------------------------------

    def remove_duplicate_rows(self):

        logger.info("Removing Duplicate Rows...")

        before = len(self.df)

        duplicate_columns = [
            "Internship Id"
        ]

        self.df = self.df.drop_duplicates(
            subset=duplicate_columns,
            keep="first"
        )

        after = len(self.df)

        logger.info(
            f"Removed {before - after} duplicate internships."
        )

    def sort_dataset(self):

        logger.info("Sorting Dataset...")

        self.df = self.df.sort_values(
            by=[
                "Company Name",
                "Role"
            ]
        ).reset_index(drop=True)

    # ----------------------------------------------------------

    def clean(self):

        logger.info("=" * 60)
        logger.info("Cleaning Dataset")
        logger.info("=" * 60)

        self.clean_company_name()

        self.clean_role()

        self.clean_location()

        self.clean_skills()

        self.clean_perks()

        self.fill_missing_values()

        self.remove_duplicate_rows()

        self.sort_dataset()

        logger.info("Dataset Cleaning Completed")

        return self.df