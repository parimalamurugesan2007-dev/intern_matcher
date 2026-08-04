"""
Schema Mapper

Converts Adzuna jobs into the same schema
used by the Internshala dataset.
"""

from __future__ import annotations

import pandas as pd

from src.resume.skill_extractor import SkillExtractor
from src.preprocessing.role_normalizer import RoleNormalizer
from src.utils.logger import logger


class SchemaMapper:

    def __init__(self):

        self.skill_extractor = SkillExtractor(
    "data/processed/internships_processed.csv"
        )
        

    # -----------------------------------------------------

    def create_skills(self, description):

        if pd.isna(description):
            return []

        skills = self.skill_extractor.extract(description)
        return ", ".join(skills)

    # -----------------------------------------------------

    def build_text(self, row):

        values = [

            str(row["Role"]),

            str(row["Company Name"]),

            str(row["Location"]),

            str(row["Description"]),

            str(row["Skills"])

        ]

        return " ".join(values)

    # -----------------------------------------------------

    def run(self):

        logger.info("=" * 60)
        logger.info("Loading Adzuna Dataset")
        logger.info("=" * 60)

        df = pd.read_csv(
            "data/raw/adzuna_raw.csv"
        )

        logger.info(f"Records : {len(df)}")

        # ------------------------------------------

        df["Role"] = df["Title"]

        df["Company Name"] = df["Company"]

        # ------------------------------------------

        logger.info("Extracting Skills...")

        df["Skills"] = df["Description"].apply(
            self.create_skills
        )

        # ------------------------------------------

        logger.info("Normalizing Roles...")

        df = RoleNormalizer(df).normalize()

        # ------------------------------------------

        logger.info("Creating Internship Text...")

        df["Internship Text"] = df.apply(
            self.build_text,
            axis=1
        )

        # ------------------------------------------

        output = df[
            [

                "Job ID",

                "Role",

                "Company Name",

                "Location",

                "Description",

                "Skills",

                "Normalized Role",

                "Internship Text",

                "Salary Min",

                "Salary Max",

                "URL"

            ]
        ]

        output.to_csv(

            "data/processed/adzuna_processed.csv",

            index=False

        )

        logger.info("=" * 60)
        logger.info("Saved Processed Adzuna Dataset")
        logger.info("=" * 60)

        logger.info(f"Records : {len(output)}")


if __name__ == "__main__":

    SchemaMapper().run()