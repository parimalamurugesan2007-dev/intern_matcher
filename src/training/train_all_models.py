"""
Train and Compare Domain Classifiers

Models:
1. Logistic Regression
2. Random Forest
3. XGBoost

Author:
Internship Intelligence Platform
"""

from __future__ import annotations

import json
import os

import joblib
import pandas as pd
from src.mlops.mlflow_logger import MLFlowLogger
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder

from sklearn.model_selection import train_test_split

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report
)

from xgboost import XGBClassifier

from src.utils.logger import logger


class ModelTrainer:

    def __init__(self):

        self.dataset_path = "data/final/training_dataset_domain.csv"

        self.model_dir = "src/models/saved"

        os.makedirs(
            self.model_dir,
            exist_ok=True
        )

    # ---------------------------------------------------------

    def load_dataset(self):

        logger.info("=" * 60)
        logger.info("Loading Dataset")
        logger.info("=" * 60)

        df = pd.read_csv(
            self.dataset_path
        )

        df = df.dropna(
            subset=[
                "Internship Text",
                "Domain"
            ]
        )

        logger.info(
            f"Records : {len(df)}"
        )

        return df

    # ---------------------------------------------------------

    def prepare_data(self, df):

        logger.info("=" * 60)
        logger.info("Preparing Dataset")
        logger.info("=" * 60)

        vectorizer = TfidfVectorizer(

            max_features=10000,

            ngram_range=(1,2),

            stop_words="english"

        )

        X = vectorizer.fit_transform(
            df["Internship Text"]
        )

        encoder = LabelEncoder()

        y = encoder.fit_transform(
            df["Domain"]
        )

        X_train, X_test, y_train, y_test = train_test_split(

            X,

            y,

            test_size=0.20,

            random_state=42,

            stratify=y

        )

        return (

            X_train,

            X_test,

            y_train,

            y_test,

            vectorizer,

            encoder

        )

    # ---------------------------------------------------------

    def evaluate(

        self,

        model,

        X_test,

        y_test

    ):

        prediction = model.predict(
            X_test
        )

        metrics = {

            "accuracy": accuracy_score(
                y_test,
                prediction
            ),

            "precision": precision_score(
                y_test,
                prediction,
                average="weighted",
                zero_division=0
            ),

            "recall": recall_score(
                y_test,
                prediction,
                average="weighted",
                zero_division=0
            ),

            "f1": f1_score(
                y_test,
                prediction,
                average="weighted",
                zero_division=0
            )

        }

        report = classification_report(

            y_test,

            prediction,

            zero_division=0

        )

        return metrics, report
        # ---------------------------------------------------------

    def train_models(

        self,

        X_train,

        y_train

    ):

        logger.info("=" * 60)
        logger.info("Training Models")
        logger.info("=" * 60)

        models = {

            "Logistic Regression": LogisticRegression(

                max_iter=1000,

                random_state=42

            ),

            "Random Forest": RandomForestClassifier(

                n_estimators=300,

                random_state=42,

                n_jobs=-1

            ),

            "XGBoost": XGBClassifier(

                n_estimators=300,

                learning_rate=0.1,

                max_depth=8,

                random_state=42,

                objective="multi:softmax",

                eval_metric="mlogloss"

            )

        }

        trained = {}

        for name, model in models.items():

            logger.info(f"Training {name}")

            model.fit(

                X_train,

                y_train

            )

            trained[name] = model

        return trained

    # ---------------------------------------------------------

    

    # ---------------------------------------------------------

    def run(self):

        df = self.load_dataset()

        (

            X_train,

            X_test,

            y_train,

            y_test,

            vectorizer,

            encoder

        ) = self.prepare_data(df)

        models = self.train_models(

            X_train,

            y_train

        )
        mlflow_logger = MLFlowLogger()

        leaderboard = {}

        best_model = None
        best_name = None
        best_metrics = None
        best_report = None

        best_f1 = -1

        logger.info("=" * 60)
        logger.info("Evaluating Models")
        logger.info("=" * 60)

        for name, model in models.items():

            metrics, report = self.evaluate(

                model,

                X_test,

                y_test

            )
            print()

            print("=" * 60)

            print(name)

            print("=" * 60)
            print(metrics)
            leaderboard[name] = metrics
            # ---------------------------------------------------------
# MLflow Logging
# ---------------------------------------------------------

            params = {}

            if name == "Logistic Regression":

                params = {

                    "algorithm": "LogisticRegression",

                    "max_iter": 1000,

                    "random_state": 42

                }

            elif name == "Random Forest":

                params = {

                    "algorithm": "RandomForest",

                    "n_estimators": 300,

                    "random_state": 42,

                    "n_jobs": -1

                }

            elif name == "XGBoost":

                params = {

                    "algorithm": "XGBoost",

                    "n_estimators": 300,

                    "learning_rate": 0.1,

                    "max_depth": 8,

                    "objective": "multi:softmax"

                }
         

            mlflow_logger.log_model(

                model_name=name,

                model=model,

                metrics=metrics,

                params=params,

                vectorizer=vectorizer,

                

            )


           

            if metrics["f1"] > best_f1:

                best_f1 = metrics["f1"]

                best_model = model

                best_name = name

                best_metrics = metrics

                best_report = report

        print()

        print("=" * 60)

        print("Leaderboard")

        print("=" * 60)

        print(pd.DataFrame(leaderboard).T)

        self.save_best_model(

            best_name,

            best_model,

            vectorizer,

            encoder,

            best_metrics,

            best_report

        )

        logger.info("=" * 60)
        logger.info("Training Completed")
        logger.info("=" * 60)
    def save_best_model(

            self,

            best_name,

            best_model,

            vectorizer,

            encoder,

            metrics,

            report

        ):

            logger.info("=" * 60)
            logger.info("Saving Best Model")
            logger.info("=" * 60)

            joblib.dump(

                best_model,

                f"{self.model_dir}/best_model.pkl"

            )

            joblib.dump(

                vectorizer,

                f"{self.model_dir}/vectorizer.pkl"

            )

            joblib.dump(

                encoder,

                f"{self.model_dir}/label_encoder.pkl"

            )

            with open(

                f"{self.model_dir}/metrics.json",

                "w"

            ) as f:

                json.dump(

                    metrics,

                    f,

                    indent=4

                )

            with open(

                f"{self.model_dir}/classification_report.txt",

                "w"

            ) as f:

                f.write(report)

            logger.info(f"Best Model : {best_name}")

if __name__ == "__main__":

    ModelTrainer().run()