"""
Model Selector

Evaluates trained models and chooses the best one.
"""

import os
import joblib
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
)


class ModelSelector:

    def __init__(self):

        self.results = []

    def evaluate(
        self,
        models,
        X_test,
        y_test
    ):

        best_model = None
        best_score = 0

        for name, model in models.items():

            prediction = model.predict(X_test)

            accuracy = accuracy_score(
                y_test,
                prediction
            )

            precision = precision_score(
                y_test,
                prediction,
                average="weighted",
                zero_division=0
            )

            recall = recall_score(
                y_test,
                prediction,
                average="weighted",
                zero_division=0
            )

            f1 = f1_score(
                y_test,
                prediction,
                average="weighted",
                zero_division=0
            )

            self.results.append({

                "Model": name,
                "Accuracy": accuracy,
                "Precision": precision,
                "Recall": recall,
                "F1": f1
            })

            if f1 > best_score:

                best_score = f1
                best_model = model
                best_name = name

        return best_model, best_name

    def save_results(self):

        os.makedirs(
            "src/models/saved",
            exist_ok=True
        )

        df = pd.DataFrame(
            self.results
        )

        df.to_csv(

            "src/models/saved/model_metrics.csv",
            index=False
        )

    def save_model(
        self,
        model
    ):

        joblib.dump(

            model,
            "src/models/saved/best_model.pkl"
        )