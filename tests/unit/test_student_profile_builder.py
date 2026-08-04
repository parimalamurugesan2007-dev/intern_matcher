from src.resume.parser import ResumeParser
from src.resume.profile_extractor import ProfileExtractor
from src.recommender.student_profile_builder import StudentProfileBuilder


def test_student_profile_builder():

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

    builder = StudentProfileBuilder()

    student_text = builder.build(profile)

    assert isinstance(student_text, str)
    assert len(student_text) > 0

    for skill in profile["skills"]:
        assert skill in student_text