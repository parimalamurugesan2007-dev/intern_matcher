from src.resume.parser import ResumeParser
from src.resume.profile_extractor import ProfileExtractor


def test_profile_extractor():

    parser = ResumeParser(
        "data/resumes/sample_resume.pdf"
    )

    resume_text = parser.parse()

    extractor = ProfileExtractor()
       

    profile = extractor.extract_profile(resume_text)

    assert isinstance(profile, dict)

    assert "name" in profile
    assert "email" in profile
    assert "skills" in profile

    assert isinstance(profile["skills"], list)

    assert len(profile["skills"]) > 0