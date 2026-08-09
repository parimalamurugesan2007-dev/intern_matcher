"""
MLflow Logger

Author : Internship Intelligence Platform

Description
-----------
Utility class for logging parameters, metrics, models, vectorizers,
and artifacts to MLflow for every model-training run.

NOTE: A prior version of this file logged the model / vectorizer /
artifacts *outside* the ``with mlflow.start_run()`` block, which
silently logged them to whatever run happened to be active (or
crashed once execution left the block). That has been fixed here:
everything for a single training run happens inside one run context.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Optional

import mlflow
import mlflow.sklearn
import mlflow.xgboost
from xgboost import XGBClassifier

from src.config.settings import settings
from src.utils.logger import logger


class MLFlowLogger:
    """Logs a single training run (params, metrics, model, vectorizer, artifacts) to MLflow."""

    def __init__(
        self,
        tracking_uri: str = settings.MLFLOW_TRACKING_URI,
        experiment_name: str = settings.MLFLOW_EXPERIMENT_NAME,
    ) -> None:
        mlflow.set_tracking_uri(tracking_uri)
        mlflow.set_experiment(experiment_name)

        logger.info(f"MLflow tracking URI : {tracking_uri}")
        logger.info(f"MLflow experiment   : {experiment_name}")

    # ---------------------------------------------------------

    def log_model(
        self,
        model_name: str,
        model: Any,
        metrics: dict[str, float],
        params: Optional[dict[str, Any]] = None,
        vectorizer: Any = None,
        artifacts: Optional[list[str]] = None,
        tags: Optional[dict[str, str]] = None,
    ) -> str:
        """
        Log one full training run to MLflow.

        Returns the MLflow run_id so callers can persist it alongside
        the locally saved model artifacts (for traceability).
        """

        with mlflow.start_run(run_name=model_name) as run:
            # -------------------------------------------------
            # Tags
            # -------------------------------------------------
            if tags:
                mlflow.set_tags(tags)

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
                    try:
                        mlflow.log_metric(key, float(value))
                    except (TypeError, ValueError):
                        logger.warning(f"Skipping non-numeric metric '{key}'={value!r}")

            # -------------------------------------------------
            # Model
            # -------------------------------------------------
            try:
                if isinstance(model, XGBClassifier):
                    mlflow.xgboost.log_model(xgb_model=model, artifact_path="model")
                else:
                    mlflow.sklearn.log_model(sk_model=model, artifact_path="model")
            except Exception as error:
                logger.error(f"Failed to log model to MLflow: {error}")

            # -------------------------------------------------
            # Vectorizer
            # -------------------------------------------------
            if vectorizer is not None:
                try:
                    mlflow.sklearn.log_model(sk_model=vectorizer, artifact_path="vectorizer")
                except Exception as error:
                    logger.error(f"Failed to log vectorizer to MLflow: {error}")

            # -------------------------------------------------
            # Artifacts
            # -------------------------------------------------
            if artifacts:
                for artifact in artifacts:
                    path = Path(artifact)
                    if path.exists():
                        mlflow.log_artifact(str(path))
                    else:
                        logger.warning(f"Artifact not found, skipping: {path}")

            run_id = run.info.run_id

            logger.info("=" * 60)
            logger.info("MLflow Run Completed")
            logger.info(f"Run Name : {model_name}")
            logger.info(f"Run ID   : {run_id}")
            logger.info("=" * 60)

            return run_id
