"""
Merge Internshala + Adzuna Dataset
"""

from __future__ import annotations

import pandas as pd

from src.utils.logger import logger


class DatasetMerger:

    def __init__(self):

        self.internshala_path = "data/processed/internships_processed.csv"

        self.adzuna_path = "data/processed/adzuna_processed.csv"

        self.output_path = "data/final/training_dataset.csv"

    # -------------------------------------------------------

    def load(self):

        logger.info("=" * 60)
        logger.info("Loading Datasets")
        logger.info("=" * 60)

        intern = pd.read_csv(self.internshala_path)

        adzuna = pd.read_csv(self.adzuna_path)

        logger.info(f"Internshala : {len(intern)}")

        logger.info(f"Adzuna      : {len(adzuna)}")

        return intern, adzuna

    # -------------------------------------------------------

    def standardize_adzuna(self, df):

        df["Internship Id"] = df["Job ID"]

        df["Normalized Skills"] = df["Skills"]

        df["Intern Type"] = "Internship"

        df["Duration"] = ""

        df["Average Stipend"] = (
            (df["Salary Min"].fillna(0) +
             df["Salary Max"].fillna(0)) / 2
        )

        df["Website Link"] = df["URL"]

        return df

    # -------------------------------------------------------

    def merge(self):

        intern, adzuna = self.load()

        adzuna = self.standardize_adzuna(adzuna)

        common_columns = [

            "Internship Id",

            "Role",

            "Company Name",

            "Location",

            "Skills",

            "Normalized Role",

            "Normalized Skills",

            "Internship Text",

            "Average Stipend",

            "Website Link"

        ]

        intern = intern[common_columns]

        adzuna = adzuna[common_columns]

        merged = pd.concat(

            [intern, adzuna],

            ignore_index=True

        )

        before = len(merged)

        merged = merged.drop_duplicates(

            subset=[

                "Role",

                "Company Name",

                "Location"

            ]

        )

        after = len(merged)

        logger.info("=" * 60)

        logger.info(f"Before Merge : {before}")

        logger.info(f"After Merge  : {after}")

        logger.info("=" * 60)

        merged.to_csv(

            self.output_path,

            index=False

        )

        logger.info("Merged Dataset Saved")


if __name__ == "__main__":

    DatasetMerger().merge()