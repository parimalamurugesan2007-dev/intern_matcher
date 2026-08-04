"""
Train Internship Domain Classifier

Input:
    data/processed/internships_processed.csv

Feature:
    Skills Text

Target:
    Normalized Role

Models:
    Logistic Regression
    Random Forest
    XGBoost

Outputs:
    vectorizer.pkl
    best_model.pkl
    model_metrics.csv
"""

import os
import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

from src.training.model_trainer import ModelTrainer
from src.training.model_selector import ModelSelector


class DomainClassifierTrainer:

    def __init__(

        self,

        dataset_path="data/final/training_dataset_domain.csv"
    ):

        self.dataset_path = dataset_path

        self.vectorizer = TfidfVectorizer(

            max_features=5000,

            ngram_range=(1, 2),

            stop_words="english"
        )

        self.label_encoder = LabelEncoder()

    # ---------------------------------------------------------

    def load_dataset(self):

        print("=" * 70)
        print("Loading Dataset")
        print("=" * 70)

        df = pd.read_csv(self.dataset_path)

        df = df.dropna(

            subset=["Skills", "Domain"]
        )

        df = df.reset_index(drop=True)

        print(f"Records : {len(df)}")

        return df

    # ---------------------------------------------------------

    def prepare_data(self, df):

        X = df["Skills"]

        y = df["Domain"]

        y = self.label_encoder.fit_transform(y)

        X = self.vectorizer.fit_transform(X)

        return train_test_split(

            X,

            y,

            test_size=0.20,

            random_state=42,

            stratify=y
        )

    # ---------------------------------------------------------

    def save_vectorizer(self):

        os.makedirs(

            "src/models/saved",

            exist_ok=True
        )

        joblib.dump(

            self.vectorizer,

            "src/models/saved/vectorizer.pkl"
        )

        joblib.dump(

            self.label_encoder,

            "src/models/saved/label_encoder.pkl"
        )

    # ---------------------------------------------------------

    def run(self):

        df = self.load_dataset()

        (

            X_train,

            X_test,

            y_train,

            y_test

        ) = self.prepare_data(df)

        trainer = ModelTrainer()

        trained_models = trainer.train_all(

            X_train,

            y_train
        )

        selector = ModelSelector()

        best_model, best_name = selector.evaluate(

            trained_models,

            X_test,

            y_test
        )

        selector.save_results()

        selector.save_model(best_model)

        self.save_vectorizer()

        print("\n" + "=" * 70)

        print("Training Completed")

        print("=" * 70)

        print(f"Best Model : {best_name}")

        print("Saved : best_model.pkl")

        print("Saved : vectorizer.pkl")

        print("Saved : label_encoder.pkl")

        print("Saved : model_metrics.csv")


if __name__ == "__main__":

    DomainClassifierTrainer().run()