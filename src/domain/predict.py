"""
Domain Predictor

Loads the trained classifier and predicts the
student's preferred internship domain.
"""

from __future__ import annotations

import joblib

from pathlib import Path


class DomainPredictor:

    def __init__(self):

        model_dir = Path("src/models/saved")

        self.model = joblib.load(
            model_dir / "best_model.pkl"
        )

        self.vectorizer = joblib.load(
            model_dir / "vectorizer.pkl"
        )

        self.encoder = joblib.load(
            model_dir / "label_encoder.pkl"
        )

    # -----------------------------------------------------

    def predict(self, resume_text: str) -> str:

        vector = self.vectorizer.transform(
            [resume_text]
        )

        prediction = self.model.predict(vector)

        domain = self.encoder.inverse_transform(
            prediction
        )[0]

        return domain