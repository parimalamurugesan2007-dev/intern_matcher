"""
Domain Predictor

Author : Internship Intelligence Platform

Description:
Loads the trained TF-IDF + classifier model and predicts the
student's preferred internship domain.

IMPORTANT:
    The predictor uses the FINAL EXTRACTED SKILL LIST (not raw
    resume text) as input to the TF-IDF vectorizer.

    It calls model.predict_proba() and returns the Top-5 domains
    with confidence scores.
"""

from __future__ import annotations

import joblib
from pathlib import Path
from typing import Any

from src.config.settings import settings
from src.utils.logger import logger


class DomainPredictor:
    """Loads the trained classifier once and reuses it for every request."""

    def __init__(self) -> None:
        model_dir = Path(settings.MODEL_DIR)

        self.model = joblib.load(model_dir / "best_model.pkl")
        self.vectorizer = joblib.load(model_dir / "vectorizer.pkl")
        self.encoder = joblib.load(model_dir / "label_encoder.pkl")

        logger.info("=" * 60)
        logger.info("Domain Predictor Model Loaded")
        logger.info("=" * 60)

    # ---------------------------------------------------------

    def predict(self, skill_text: str) -> str:
        """
        Predict a single best domain label.

        *skill_text* should be the final extracted skill list
        joined into a single string — NOT the raw resume text.
        """

        try:
            vector = self.vectorizer.transform([skill_text])
            prediction = self.model.predict(vector)
            domain = self.encoder.inverse_transform(prediction)[0]

            logger.info(f"Predicted domain: {domain}")
            return str(domain)

        except Exception as error:
            logger.error(f"Domain prediction failed: {error}")
            return "Others"

    # ---------------------------------------------------------

    def predict_top_domains(
        self,
        skill_text: str,
        top_k: int = settings.TOP_K_DOMAINS,
    ) -> list[dict[str, Any]]:
        """
        Return the Top-K predicted domains with confidence scores.

        Uses model.predict_proba() to get per-class probabilities,
        then maps indices back to domain labels via the label encoder.

        *skill_text* should be the final extracted skill list
        joined into a single string — NOT the raw resume text.
        """

        try:
            vector = self.vectorizer.transform([skill_text])
            probabilities = self.model.predict_proba(vector)[0]

            top_indices = probabilities.argsort()[-top_k:][::-1]

            results: list[dict[str, Any]] = []
            for idx in top_indices:
                domain = self.encoder.inverse_transform([idx])[0]
                confidence = round(float(probabilities[idx]), 4)
                results.append({
                    "domain": str(domain),
                    "confidence": confidence,
                })

            logger.info(f"Top-{top_k} domains: {results}")
            return results

        except Exception as error:
            logger.error(f"Top domain prediction failed: {error}")
            return [{"domain": "Others", "confidence": 0.0}]

    # ---------------------------------------------------------

    def predict_from_skills(self, skills: list[str]) -> str:
        """Convenience wrapper: join a skill list then predict."""

        skill_text = " ".join(skills)
        return self.predict(skill_text)

    # ---------------------------------------------------------

    def predict_top_domains_from_skills(
        self,
        skills: list[str],
        top_k: int = settings.TOP_K_DOMAINS,
    ) -> list[dict[str, Any]]:
        """Convenience wrapper: join a skill list then predict top-K."""

        skill_text = " ".join(skills)
        return self.predict_top_domains(skill_text, top_k=top_k)
