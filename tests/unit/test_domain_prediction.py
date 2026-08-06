from src.resume.parser import ResumeParser
from src.resume.profile_extractor import ProfileExtractor
from src.domain.predict import DomainPredictor


# Change this to your resume path
RESUME_PATH = "data/resumes/sample_resume.pdf"


def main():

    # Parse Resume
    parser = ResumeParser(RESUME_PATH)
    resume_text = parser.parse()

    # Extract Profile
    extractor = ProfileExtractor()
    profile = extractor.extract_profile(resume_text)

    # Print Extracted Skills
    print("\n" + "=" * 80)
    print("EXTRACTED SKILLS")
    print("=" * 80)
    print(profile["skills"])

    # Convert skills to text
    skill_text = " ".join(profile["skills"])

    print("\n" + "=" * 80)
    print("INPUT TO DOMAIN PREDICTOR")
    print("=" * 80)
    print(skill_text)

    # Predict Domain
    predictor = DomainPredictor()
    domain = predictor.predict(skill_text)

    print("\n" + "=" * 80)
    print("PREDICTED DOMAIN")
    print("=" * 80)
    print(domain)


if __name__ == "__main__":
    main()