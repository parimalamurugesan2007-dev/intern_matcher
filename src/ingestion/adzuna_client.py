"""
Adzuna API Client

Author : Internship Intelligence Platform

Description:
Handles all communication with the Adzuna API.
"""

from __future__ import annotations

import requests

from src.config.adzuna_config import (
    APP_ID,
    APP_KEY,
    COUNTRY,
    RESULTS_PER_PAGE
)

from src.utils.logger import logger


class AdzunaClient:

    BASE_URL = "https://api.adzuna.com/v1/api/jobs"

    def __init__(self):

        if APP_ID is None or APP_KEY is None:
            raise ValueError(
                "Adzuna credentials not found in .env"
            )

    # ---------------------------------------------------------

    def search(
        self,
        keyword: str,
        page: int = 1
    ):

        logger.info("=" * 60)
        logger.info(f"Searching : {keyword}")
        logger.info("=" * 60)

        url = (
            f"{self.BASE_URL}/{COUNTRY}/search/{page}"
        )

        params = {

            "app_id": APP_ID,
            "app_key": APP_KEY,

            "results_per_page": RESULTS_PER_PAGE,

            "what": keyword,

            "content-type": "application/json"

        }

        response = requests.get(
            url,
            params=params,
            timeout=60
        )

        response.raise_for_status()

        return response.json()