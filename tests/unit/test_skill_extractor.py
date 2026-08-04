from src.resume.parser import ResumeParser
from src.resume.skill_extractor import SkillExtractor

parser = ResumeParser("data/resumes/sample_resume.pdf")
text = parser.parse()

# No dataset path required anymore
extractor = SkillExtractor()

skills = extractor.extract(text)

print("\nDetected Skills")
print("-" * 50)

for skill in skills:
    print(skill)