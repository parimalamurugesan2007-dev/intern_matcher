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

    def predict(self, skill_text):

        print("\n" + "="*60)
        print("INPUT TO DOMAIN PREDICTOR")
        print("="*60)
        print(skill_text)

        vector = self.vectorizer.transform([skill_text])

        print("\nVector Shape :", vector.shape)
        print("Non Zero Features :", vector.nnz)

        prediction = self.model.predict(vector)

        probabilities = self.model.predict_proba(vector)[0]

        top = probabilities.argsort()[-5:][::-1]

        print("\nTop Predictions")

        for i in top:
            print(
                f"{self.encoder.inverse_transform([i])[0]:30}"
                f"{probabilities[i]:.3f}"
            )

        domain = self.encoder.inverse_transform(prediction)[0]

        print("\nPredicted :", domain)

        return domain