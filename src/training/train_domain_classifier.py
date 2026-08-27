"""
Train Internship Domain Classifier

Author : Internship Intelligence Platform

Reproducible training entry point:

    python -m src.training.train_domain_classifier

Pipeline:
    1. Load versioned data           (data/final/training_dataset_domain.csv)
    2. Validate data                 (src.training.data_validator)
    3. Preprocess / split data
    4. Build TF-IDF features
    5. Train candidate models        (Logistic Regression, Random Forest, XGBoost)
    6. Evaluate models                (accuracy, precision, recall, F1)
    7. Select best model              (highest weighted F1)
    8. Log experiment to MLflow
    9. Save model artifacts           (best_model.pkl, vectorizer.pkl, label_encoder.pkl)
   10. Save metrics                   (model_metrics.csv, classification_report.txt)
   11. Save model metadata            (model_metadata.json — name, version, timestamp,
                                        dataset version, evaluation metrics)

Input dataset columns required : Skills, Domain
Outputs (src/models/saved/)    : best_model.pkl, vectorizer.pkl, label_encoder.pkl,
                                  model_metrics.csv, model_metadata.json
"""

from __future__ import annotations
from sklearn.utils import resample
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

from src.config.settings import settings
from src.mlops.mlflow_logger import MLFlowLogger
from src.training.data_validator import TrainingDataValidationError, TrainingDataValidator
from src.training.model_selector import ModelSelector
from src.training.model_trainer import ModelTrainer
from src.utils.logger import logger


def _dataset_version_hash(path: Path) -> str:
    """Return a short md5 hash of the dataset file, used as a lightweight dataset version id."""

    hasher = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            hasher.update(chunk)
    return hasher.hexdigest()[:12]


class DomainClassifierTrainer:
    """Reproducible training pipeline for the internship-domain TF-IDF classifier."""

    def __init__(self, dataset_path: str = settings.DATASET_PATH) -> None:
        self.dataset_path = Path(dataset_path)
        self.model_dir = Path(settings.MODEL_DIR)
        self.model_dir.mkdir(parents=True, exist_ok=True)

        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            stop_words="english",
        )
        self.label_encoder = LabelEncoder()
        self.mlflow_logger = MLFlowLogger()

    # ---------------------------------------------------------
    # 1. Load
    # ---------------------------------------------------------

    def load_dataset(self) -> pd.DataFrame:
        logger.info("=" * 70)
        logger.info("Loading Training Dataset")
        logger.info("=" * 70)

        if not self.dataset_path.exists():
            raise FileNotFoundError(
                f"Training dataset not found: {self.dataset_path}. "
                "If this project uses DVC, run `dvc pull` to fetch the versioned dataset first."
            )

        df = pd.read_csv(self.dataset_path)
        logger.info(f"Dataset loaded: {len(df)} rows from {self.dataset_path}")
        return df

    # ---------------------------------------------------------
    # 2. Validate
    # ---------------------------------------------------------

    def validate_dataset(self, df: pd.DataFrame) -> dict[str, Any]:
        validator = TrainingDataValidator(df)
        try:
            report = validator.run(strict=True)
        except TrainingDataValidationError as error:
            logger.error(f"Training dataset failed validation: {error}")
            raise
        return report.as_dict()

    # ---------------------------------------------------------
    # 3-4. Preprocess + features
    # ---------------------------------------------------------

    def prepare_data(self, df: pd.DataFrame):
        df = df.dropna(subset=["Skills", "Domain"]).reset_index(drop=True)
        df = df[df["Skills"].astype(str).str.strip() != ""]
        df = df[df["Domain"].astype(str).str.strip() != ""]
        df = df.reset_index(drop=True)

        # Drop domain classes with fewer than 2 examples so stratified split works.
        counts = df["Domain"].value_counts()
        valid_domains = counts[counts >= 2].index
        dropped = int((~df["Domain"].isin(valid_domains)).sum())
        if dropped:
            logger.warning(f"Dropping {dropped} rows belonging to domains with < 2 examples")
        df = df[df["Domain"].isin(valid_domains)].reset_index(drop=True)

        logger.info(f"Usable rows after cleaning: {len(df)}")
        # Balance classes — cap majority domains and upsample minority ones
        # so the model stops defaulting to "Others" for every resume.
        max_samples_per_domain = 300
        min_samples_per_domain = 30

        balanced_parts = []
        for domain in df["Domain"].unique():
            domain_df = df[df["Domain"] == domain]
            if len(domain_df) > max_samples_per_domain:
                domain_df = domain_df.sample(n=max_samples_per_domain, random_state=42)
            elif len(domain_df) < min_samples_per_domain and len(domain_df) >= 2:
                domain_df = resample(domain_df, replace=True, n_samples=min_samples_per_domain, random_state=42)
            balanced_parts.append(domain_df)

        df = pd.concat(balanced_parts).sample(frac=1, random_state=42).reset_index(drop=True)
        logger.info(f"Balanced dataset: {len(df)} rows | {df['Domain'].nunique()} domains")
        logger.info(f"Domain distribution:\n{df['Domain'].value_counts()}")
        logger.info(f"Domain classes: {df['Domain'].nunique()}")

        X_text = df["Skills"]
        y = self.label_encoder.fit_transform(df["Domain"])
        X = self.vectorizer.fit_transform(X_text)

        return train_test_split(
            X, y, test_size=0.20, random_state=42, stratify=y
        )

    # ---------------------------------------------------------
    # Save artifacts
    # ---------------------------------------------------------

    def save_vectorizer(self) -> None:
        joblib.dump(self.vectorizer, self.model_dir / "vectorizer.pkl")
        joblib.dump(self.label_encoder, self.model_dir / "label_encoder.pkl")
        logger.info(f"Saved vectorizer.pkl and label_encoder.pkl to {self.model_dir}")

    def save_metadata(
        self,
        best_name: str,
        metrics: dict[str, float],
        dataset_version: str,
        run_id: str | None,
        registry_report: dict[str, Any] | None = None,
    ) -> None:
        metadata = {
            "model_name": best_name,
            "model_version": datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S"),
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "dataset_path": str(self.dataset_path),
            "dataset_version": dataset_version,
            "metrics": metrics,
            "mlflow_run_id": run_id,
            "registry": registry_report or {"registered": False},
            "domains": list(self.label_encoder.classes_),
        }
        metadata_path = Path(settings.MODEL_METADATA_PATH)
        metadata_path.parent.mkdir(parents=True, exist_ok=True)
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        logger.info(f"Saved model metadata to {metadata_path}")

    # ---------------------------------------------------------
    # Main entry point
    # ---------------------------------------------------------

    def run(self) -> dict[str, Any]:
        df = self.load_dataset()
        self.validate_dataset(df)

        dataset_version = _dataset_version_hash(self.dataset_path)
        logger.info(f"Dataset version hash: {dataset_version}")

        X_train, X_test, y_train, y_test = self.prepare_data(df)

        trainer = ModelTrainer()
        trained_models = trainer.train_all(X_train, y_train)

        selector = ModelSelector()
        best_model, best_name = selector.evaluate(trained_models, X_test, y_test)
        selector.save_results()
        selector.save_model(best_model)

        self.save_vectorizer()

        best_metrics = next(
            (r for r in selector.results if r["Model"] == best_name), {}
        )
        metrics = {
            k: v for k, v in best_metrics.items() if k != "Model"
        }

        run_id: str | None = None
        registry_report: dict[str, Any] = {"registered": False}
        try:
            run_id = self.mlflow_logger.log_model(
                model_name=best_name,
                model=best_model,
                metrics=metrics,
                params={
                    "vectorizer": "TfidfVectorizer",
                    "max_features": 5000,
                    "ngram_range": "(1, 2)",
                    "test_size": 0.20,
                },
                vectorizer=self.vectorizer,
                artifacts=[str(self.model_dir / "model_metrics.csv")],
                tags={
                    "dataset_version": dataset_version,
                    "dataset_path": str(self.dataset_path),
                },
            )
            registry_report = self.mlflow_logger.register_and_promote(
                run_id=run_id,
                metrics=metrics,
            )
        except Exception as error:
            logger.error(f"MLflow logging/registration failed (model artifacts were still saved locally): {error}")

        self.save_metadata(best_name, metrics, dataset_version, run_id, registry_report)

        logger.info("=" * 70)
        logger.info("Training Completed")
        logger.info("=" * 70)
        logger.info(f"Best Model : {best_name}")
        logger.info(f"Metrics    : {metrics}")
        logger.info(f"Registry   : {registry_report}")
        logger.info("Saved : best_model.pkl, vectorizer.pkl, label_encoder.pkl, model_metrics.csv, model_metadata.json")

        return {
            "best_model": best_name,
            "metrics": metrics,
            "dataset_version": dataset_version,
            "mlflow_run_id": run_id,
            "registry": registry_report,
        }
       


if __name__ == "__main__":
    DomainClassifierTrainer().run()
