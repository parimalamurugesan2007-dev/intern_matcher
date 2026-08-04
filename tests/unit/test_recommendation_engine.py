from src.resume.parser import ResumeParser
from src.resume.profile_extractor import ProfileExtractor
from src.domain.predict import DomainPredictor
from src.recommender.recommendation_engine import RecommendationEngine


def test_complete_pipeline():

    parser = ResumeParser(
        "data/resumes/sample_resume.pdf"
    )

    resume_text = parser.parse()

    assert isinstance(resume_text, str)
    assert len(resume_text) > 100

    extractor = ProfileExtractor()

    profile = extractor.extract_profile(resume_text)

    assert isinstance(profile, dict)
    assert "skills" in profile

    predictor = DomainPredictor()

    predicted_domain = predictor.predict(resume_text)

    assert isinstance(predicted_domain, str)
    assert len(predicted_domain) > 0

    profile["preferred_domain"] = predicted_domain

    engine = RecommendationEngine(
        dataset_path="data/final/training_dataset_domain.csv",
        embedding_path="src/models/saved/internship_embeddings.npy",
        index_path="data/embeddings/internship_index.csv",
    )

    results = engine.recommend(
        student_text=resume_text,
        student_skills=profile["skills"],
        preferred_domain=predicted_domain,
        top_k=10,
    )

    assert len(results) == 10

    expected_columns = [
        "Role",
        "Company Name",
        "Location",
        "Domain",
        "Average Stipend",
        "semantic_score",
        "skill_overlap",
        "final_score",
        "recommendation_level",
    ]

    for column in expected_columns:
        assert column in results.columns