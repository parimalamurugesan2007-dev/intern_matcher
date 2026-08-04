"""
Fetch Technical Internships from Adzuna
"""

from __future__ import annotations

import pandas as pd

from src.ingestion.adzuna_client import AdzunaClient
from src.config.adzuna_config import TECHNICAL_KEYWORDS
from src.utils.logger import logger


class TechnicalJobFetcher:

    def __init__(self):

        self.client = AdzunaClient()

        self.jobs = []

        self.seen = set()

    # -----------------------------------------------------

    def fetch_keyword(self, keyword):

        logger.info("=" * 60)
        logger.info(f"Fetching : {keyword}")
        logger.info("=" * 60)

        page = 1

        while True:

            response = self.client.search(
                keyword=keyword,
                page=page
            )

            results = response.get("results", [])

            if len(results) == 0:
                break

            for job in results:

                job_id = job["id"]

                if job_id in self.seen:
                    continue

                self.seen.add(job_id)

                self.jobs.append(job)

            print(
                f"Page {page} : {len(results)} jobs"
            )

            page += 1

            if page > 20:
                break

    # -----------------------------------------------------

    def save(self):

        rows = []

        for job in self.jobs:

            rows.append({

                "Job ID":
                    job.get("id"),

                "Title":
                    job.get("title"),

                "Company":
                    job.get("company", {}).get(
                        "display_name"
                    ),

                "Location":
                    job.get("location", {}).get(
                        "display_name"
                    ),

                "Description":
                    job.get("description"),

                "Salary Min":
                    job.get("salary_min"),

                "Salary Max":
                    job.get("salary_max"),

                "Contract":
                    job.get("contract_type"),

                "Category":
                    job.get("category", {}).get(
                        "label"
                    ),

                "URL":
                    job.get("redirect_url")

            })

        df = pd.DataFrame(rows)

        df.to_csv(

            "data/raw/adzuna_raw.csv",

            index=False

        )

        logger.info("=" * 60)
        logger.info(f"Saved {len(df)} jobs")
        logger.info("=" * 60)

    # -----------------------------------------------------

    def run(self):

        for keyword in TECHNICAL_KEYWORDS:

            self.fetch_keyword(keyword)

        self.save()


if __name__ == "__main__":

    TechnicalJobFetcher().run()