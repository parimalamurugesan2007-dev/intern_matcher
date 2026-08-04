from src.resume.parser import ResumeParser
from src.resume.profile_extractor import ProfileExtractor
from src.recommender.skill_gap_analyzer import SkillGapAnalyzer


def test_skill_gap():

    parser = ResumeParser(
        "data/resumes/sample_resume.pdf"
    )

    resume_text = parser.parse()

    extractor = ProfileExtractor(
        "data/final/training_dataset_domain.csv"
    )

    profile = extractor.extract_profile(
        resume_text
    )

    analyzer = SkillGapAnalyzer()

    internship_skills = [
        "Python",
        "Machine Learning",
        "Docker",
        "AWS",
        "FastAPI"
    ]

    score, matched, missing = analyzer.skill_overlap_score(
        profile["skills"],
        internship_skills
    )

    resources = analyzer.learning_resources(missing)

    assert isinstance(score, float)
    assert 0 <= score <= 1

    assert isinstance(matched, list)
    assert isinstance(missing, list)
    assert isinstance(resources, dict)

    for skill in missing:
        assert skill in resources