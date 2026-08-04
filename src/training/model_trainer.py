"""
Model Trainer

Trains multiple ML models for internship domain prediction.
"""

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier


class ModelTrainer:

    def __init__(self):

        self.models = {
            "Logistic Regression":
                LogisticRegression(
                    max_iter=2000,
                    random_state=42
                ),

            "Random Forest":
                RandomForestClassifier(
                    n_estimators=200,
                    random_state=42,
                    n_jobs=-1
                ),

            "XGBoost":
                XGBClassifier(
                    objective="multi:softmax",
                    eval_metric="mlogloss",
                    random_state=42,
                    n_estimators=200,
                    learning_rate=0.1
                )
        }

    def train_all(
        self,
        X_train,
        y_train
    ):

        trained_models = {}

        for name, model in self.models.items():

            print(f"\nTraining {name}...")

            model.fit(
                X_train,
                y_train
            )

            trained_models[name] = model

        return trained_models