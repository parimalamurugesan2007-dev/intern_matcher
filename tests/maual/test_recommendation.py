from pathlib import Path
import joblib

from src.resume.parser import ResumeParser
from src.resume.profile_extractor import ProfileExtractor
from src.recommender.student_profile_builder import StudentProfileBuilder
from src.recommender.recommendation_engine import RecommendationEngine


MODEL_PATH = "src/models/saved/best_model.pkl"
VECTORIZER_PATH = "src/models/saved/vectorizer.pkl"
ENCODER_PATH = "src/models/saved/label_encoder.pkl"

DATASET_PATH = "data/final/training_dataset_domain.csv"
EMBEDDING_PATH = "data/embeddings/internship_embeddings.npy"
INDEX_PATH = "data/embeddings/internship_index.csv"

SKILL_DATASET = "data/final/training_dataset_domain.csv"

RESUME_PATH = "data/resumes/sample_resume.pdf"


def main():

    print("=" * 70)
    print("Loading Resume")
    print("=" * 70)

    parser = ResumeParser(RESUME_PATH)

    resume_text = parser.parse()

    print("Resume Loaded")

    print()

    print("=" * 70)
    print("Extracting Profile")
    print("=" * 70)

    extractor = ProfileExtractor(SKILL_DATASET)

    profile = extractor.extract_profile(resume_text)

    print(profile)

    print()

    print("=" * 70)
    print("Predicting Domain")
    print("=" * 70)

    model = joblib.load(MODEL_PATH)

    vectorizer = joblib.load(VECTORIZER_PATH)

    encoder = joblib.load(ENCODER_PATH)

    profile_text = " ".join(profile["skills"])

    prediction = model.predict(
        vectorizer.transform([profile_text])
    )

    domain = encoder.inverse_transform(prediction)[0]

    profile["preferred_domain"] = domain

    print("Predicted Domain :", domain)

    print()

    print("=" * 70)
    print("Building Student Profile")
    print("=" * 70)

    builder = StudentProfileBuilder()

    student_text = builder.build(profile)

    print(student_text)

    print()

    print("=" * 70)
    print("Generating Recommendations")
    print("=" * 70)

    engine = RecommendationEngine(
        DATASET_PATH,
        EMBEDDING_PATH,
        INDEX_PATH,
    )

    recommendations = engine.recommend(
        student_text=student_text,
        student_skills=profile["skills"],
        preferred_domain=domain,
        top_k=10,
    )

    print()

    print("=" * 70)
    print("TOP RECOMMENDATIONS")
    print("=" * 70)

    print(
    recommendations[
        [
            "Role",
            "Company Name",
            "Location",
            "Average Stipend",
            "Domain",
            "matched_skills",
            "missing_skills",
            "final_score",
            "Website Link"
        ]
    ]
)


if __name__ == "__main__":
    main()