"""
MLflow Logger

Author : Internship Intelligence Platform

Description
-----------
Utility class for logging parameters, metrics, models, vectorizers,
and artifacts to MLflow for every model-training run, and for
registering/promoting the resulting model in the MLflow Model
Registry.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Optional

import mlflow
import mlflow.sklearn
import mlflow.xgboost
from mlflow.exceptions import MlflowException
from mlflow.tracking import MlflowClient
from xgboost import XGBClassifier

from src.config.settings import settings
from src.utils.logger import logger

REGISTERED_MODEL_NAME = "internship-domain-classifier"
PROMOTION_METRIC = "F1"


class MLFlowLogger:
    """Logs a single training run (params, metrics, model, vectorizer, artifacts) to MLflow."""

    def __init__(
        self,
        tracking_uri: str = settings.MLFLOW_TRACKING_URI,
        experiment_name: str = settings.MLFLOW_EXPERIMENT_NAME,
    ) -> None:
        mlflow.set_tracking_uri(tracking_uri)
        mlflow.set_experiment(experiment_name)
        self.client = MlflowClient(tracking_uri=tracking_uri)

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
        """Log one full training run to MLflow. Returns the MLflow run_id."""

        with mlflow.start_run(run_name=model_name) as run:
            if tags:
                mlflow.set_tags(tags)

            if params:
                for key, value in params.items():
                    mlflow.log_param(key, value)

            if metrics:
                for key, value in metrics.items():
                    try:
                        mlflow.log_metric(key, float(value))
                    except (TypeError, ValueError):
                        logger.warning(f"Skipping non-numeric metric '{key}'={value!r}")

            try:
                if isinstance(model, XGBClassifier):
                    mlflow.xgboost.log_model(xgb_model=model, artifact_path="model")
                else:
                    mlflow.sklearn.log_model(sk_model=model, artifact_path="model")
            except Exception as error:
                logger.error(f"Failed to log model to MLflow: {error}")

            if vectorizer is not None:
                try:
                    mlflow.sklearn.log_model(sk_model=vectorizer, artifact_path="vectorizer")
                except Exception as error:
                    logger.error(f"Failed to log vectorizer to MLflow: {error}")

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

    # ---------------------------------------------------------
    # Model Registry
    # ---------------------------------------------------------

    def register_and_promote(
        self,
        run_id: str,
        metrics: dict[str, float],
        model_name: str = REGISTERED_MODEL_NAME,
        promotion_metric: str = PROMOTION_METRIC,
    ) -> dict[str, Any]:
        """
        Register the model from `run_id` in the MLflow Model Registry,
        then promote it to 'production' only if its `promotion_metric`
        beats the current production version's value for that metric.
        Every registered version also gets a 'staging' alias.
        """

        model_uri = f"runs:/{run_id}/model"

        try:
            registered = mlflow.register_model(model_uri=model_uri, name=model_name)
        except MlflowException as error:
            logger.error(f"Model registration failed: {error}")
            return {"registered": False, "error": str(error)}

        version = registered.version
        logger.info(f"Registered '{model_name}' version {version} (run_id={run_id})")

        self.client.set_registered_model_alias(model_name, "staging", version)

        candidate_value = metrics.get(promotion_metric)
        promoted = False
        current_production_value: float | None = None

        try:
            current_prod = self.client.get_model_version_by_alias(model_name, "production")
            current_run = self.client.get_run(current_prod.run_id)
            current_production_value = current_run.data.metrics.get(promotion_metric)
        except MlflowException:
            current_prod = None

        if current_prod is None:
            promoted = True
            reason = "no existing production version"
        elif candidate_value is not None and (
            current_production_value is None or candidate_value > current_production_value
        ):
            promoted = True
            reason = f"{promotion_metric} improved ({current_production_value} -> {candidate_value})"
        else:
            reason = f"{promotion_metric} did not improve ({candidate_value} <= {current_production_value})"

        if promoted:
            self.client.set_registered_model_alias(model_name, "production", version)
            logger.info(f"Promoted '{model_name}' v{version} to 'production': {reason}")
        else:
            logger.info(f"Did NOT promote '{model_name}' v{version} to 'production': {reason}")

        return {
            "registered": True,
            "model_name": model_name,
            "version": version,
            "promoted_to_production": promoted,
            "reason": reason,
            "candidate_metric": candidate_value,
            "previous_production_metric": current_production_value,
        }