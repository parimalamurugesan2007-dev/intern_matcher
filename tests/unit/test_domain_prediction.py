from src.domain.predict import DomainPredictor
from src.resume.parser import ResumeParser
from src.resume.profile_extractor import ProfileExtractor

RESUME_PATH = "data/resumes/sample_resume.pdf"


def _extract_skills() -> list[str]:
    parser = ResumeParser(RESUME_PATH)
    resume_text = parser.parse()

    extractor = ProfileExtractor()
    profile = extractor.extract_profile(resume_text)

    assert isinstance(profile["skills"], list)
    assert len(profile["skills"]) > 0

    return profile["skills"]


def test_predict_single_domain():
    skills = _extract_skills()
    skill_text = " ".join(skills)

    predictor = DomainPredictor()
    domain = predictor.predict(skill_text)

    assert isinstance(domain, str)
    assert len(domain) > 0


def test_predict_top_5_domains():
    skills = _extract_skills()

    predictor = DomainPredictor()
    results = predictor.predict_top_domains_from_skills(skills, top_k=5)

    assert isinstance(results, list)
    assert len(results) == 5

    for entry in results:
        assert "domain" in entry
        assert "confidence" in entry
        assert isinstance(entry["domain"], str)
        assert 0.0 <= entry["confidence"] <= 1.0

    # Confidences should be sorted descending (predict_proba ranked).
    confidences = [entry["confidence"] for entry in results]
    assert confidences == sorted(confidences, reverse=True)


def test_predict_top_k_is_configurable():
    skills = _extract_skills()

    predictor = DomainPredictor()
    results = predictor.predict_top_domains_from_skills(skills, top_k=3)

    assert len(results) == 3


def test_top_domain_matches_single_predict():
    """The highest-confidence entry in Top-K must match predict()'s single answer
    (backward-compatible `predicted_domain` guarantee)."""

    skills = _extract_skills()
    skill_text = " ".join(skills)

    predictor = DomainPredictor()
    single = predictor.predict(skill_text)
    top5 = predictor.predict_top_domains(skill_text, top_k=5)

    assert top5[0]["domain"] == single
