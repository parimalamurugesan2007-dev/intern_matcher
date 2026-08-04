from src.resume.parser import ResumeParser

def test_resume_parser():
    parser = ResumeParser("data/resumes/sample_resume.pdf")

    text = parser.parse()

    assert text is not None
    assert isinstance(text, str)
    assert len(text) > 100