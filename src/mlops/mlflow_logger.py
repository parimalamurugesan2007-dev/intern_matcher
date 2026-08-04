
"""
MLflow Logger

Author:
Internship Intelligence Platform

Description
-----------
Utility class for logging

- Parameters
- Metrics
- Model
- Vectorizer
- Artifacts

to MLflow.
"""

from __future__ import annotations

from pathlib import Path

import mlflow
import mlflow.sklearn
import mlflow.xgboost
from xgboost import XGBClassifier

class MLFlowLogger:

    def __init__(self):

        mlflow.set_experiment("Internship Intelligence Platform")

    # ---------------------------------------------------------

    def log_model(
        self,
        model_name: str,
        model,
        metrics: dict,
        params: dict | None = None,
        vectorizer=None,
        artifacts: list[str] | None = None,
    ):

        with mlflow.start_run(run_name=model_name):

            # -------------------------------------------------
            # Parameters
            # -------------------------------------------------

            if params:

                for key, value in params.items():

                    mlflow.log_param(key, value)

            # -------------------------------------------------
            # Metrics
            # -------------------------------------------------

            if metrics:

                for key, value in metrics.items():

                    mlflow.log_metric(
                        key,
                        float(value)
                    )

            # -------------------------------------------------
            # Model
            # -------------------------------------------------

            # -------------------------------------------------
# Model
# -------------------------------------------------

        if isinstance(model, XGBClassifier):

            mlflow.xgboost.log_model(
                xgb_model=model,
                name="model"
            )

        else:

            mlflow.sklearn.log_model(
                sk_model=model,
                name="model"
            )

            # -------------------------------------------------
            # Vectorizer
            # -------------------------------------------------

            if vectorizer is not None:

                mlflow.sklearn.log_model(
                    sk_model=vectorizer,
                    name="vectorizer"
                )

            # -------------------------------------------------
            # Artifacts
            # -------------------------------------------------

            if artifacts:

                for artifact in artifacts:

                    path = Path(artifact)

                    if path.exists():

                        mlflow.log_artifact(
                            str(path)
                        )

            print("=" * 60)
            print("MLflow Run Completed")
            print(f"Run Name : {model_name}")
            print("=" * 60)

