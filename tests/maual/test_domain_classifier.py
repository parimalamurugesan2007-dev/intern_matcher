import joblib

from pathlib import Path


MODEL_PATH = Path("src/models/saved/best_model.pkl")

VECTORIZER_PATH = Path("src/models/saved/vectorizer.pkl")

ENCODER_PATH = Path("src/models/saved/label_encoder.pkl")


def main():

    model = joblib.load(MODEL_PATH)

    vectorizer = joblib.load(VECTORIZER_PATH)

    encoder = joblib.load(ENCODER_PATH)

    sample = [

        "Python Flask REST API Git Linux Docker AWS SQL"

    ]

    sample_vector = vectorizer.transform(sample)

    prediction = model.predict(sample_vector)

    role = encoder.inverse_transform(prediction)

    print("=" * 60)

    print("Predicted Domain")

    print("=" * 60)

    print(role[0])


if __name__ == "__main__":

    main()