"""
Advanced Resume Profile Extractor

Internship Intelligence Platform

Extracts

• Basic Information
• Education
• Projects
• Experience
• Certifications
• Achievements
• Skills

Skills are extracted using SkillExtractor after merging
all important resume sections.
"""

from __future__ import annotations

import re

from pyparsing import line

from src.resume.skill_extractor import SkillExtractor
from src.utils.header_matcher import detect_header

class ProfileExtractor:

    def __init__(self):

        self.skill_extractor = SkillExtractor()

        self.section_headers = {

            "education": [
                "education",
                "academic background",
                "academic qualification",
                "qualification"
            ],

            "projects": [
                "PROJECTS",
                "projects",
                "academic projects",
                "project experience"
            ],

            "experience": [
                "INTERNSHIP EXPERIENCE",
                "experience",
                "work experience",
                "internship",
                "internships",
                "professional experience"
            ],

            "certifications": [
                "certifications",
                "certificates",
                "licenses",
                "courses"
            ],

            "achievements": [
                "achievements",
                "awards",
                "honors",
                "accomplishments",
                "hackathons"
            ],

                "skills": [

        "skills",

        "technical skills",

        "core skills",

        "programming skills",

        "technical expertise",

        "tech stack",

        "technologies",

        "languages",

        "tools"

    ]

        }
        # ---------------------------------------------------------

    def clean(self, text):

        return re.sub(r"\s+", " ", text).strip()

    # ---------------------------------------------------------

    def lines(self, text):

        return [
            line.strip()
            for line in text.split("\n")
            if line.strip()
        ]
        # ---------------------------------------------------------

    def extract_name(self, text):

        lines = self.lines(text)

        return lines[0] if lines else ""

    # ---------------------------------------------------------

    def extract_email(self, text):

        match = re.search(

            r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",

            text

        )

        return match.group(0) if match else ""

    # ---------------------------------------------------------

    def extract_phone(self, text):

        match = re.search(

            r"(\+91[\s-]?)?[6-9]\d{9}",

            text.replace(" ", "")

        )

        return match.group(0) if match else ""

    # ---------------------------------------------------------

    def extract_cgpa(self, text):

        patterns = [

            r"CGPA[: ]*([0-9]+(\.[0-9]+)?)",

            r"CGPA\s*[-:]\s*([0-9]+(\.[0-9]+)?)",

            r"Grade[: ]*([0-9]+(\.[0-9]+)?)"

        ]

        for pattern in patterns:

            match = re.search(

                pattern,

                text,

                re.IGNORECASE

            )

            if match:

                return float(match.group(1))

        return None
        # ---------------------------------------------------------

    def extract_degree(self, text):

        degrees = [

            "Bachelor of Technology",

            "Bachelor of Engineering",

            "Bachelor of Computer Applications",

            "Master of Technology",

            "Master of Engineering",

            "Master of Computer Applications",

            "B.Tech",

            "B.E",

            "BCA",

            "M.Tech",

            "M.E",

            "MCA",

            "MBA",

            "B.Sc",

            "M.Sc"

        ]

        for degree in degrees:

            if degree.lower() in text.lower():

                return degree

        return ""
        # ---------------------------------------------------------

    def extract_college(self, text):

        for line in self.lines(text):

            lower = line.lower()

            if (

                "college" in lower

                or "institute" in lower

                or "university" in lower

                or "school" in lower

            ):

                return line

        return ""
        # ---------------------------------------------------------


    def _is_section_header(self, line):

        return detect_header(line) is not None


        # ---------------------------------------------------------

    def extract_sections(self, text):

        lines = self.lines(text)

        sections = {}

        current = None

        buffer = []

        for line in lines:

            section = detect_header(line)

            if section:

                if current is not None:
                    sections[current] = "\n".join(buffer)

                current = section
                buffer = []
                continue

            if current:
                buffer.append(line)

        if current:

            sections[current] = "\n".join(buffer)

        return sections
        # ---------------------------------------------------------

    def extract_education(self, sections):

        if "education" not in sections:

            return []

        education = []

        current = {}

        for line in sections["education"].split("\n"):

            line = line.strip()

            if not line:

                continue

            if (

                "college" in line.lower()

                or "institute" in line.lower()

                or "university" in line.lower()

            ):

                if current:

                    education.append(current)

                    current = {}

                current["institution"] = line

            elif any(

                degree.lower() in line.lower()

                for degree in [

                    "b.tech",

                    "b.e",

                    "m.tech",

                    "mba",

                    "mca",

                    "b.sc",

                    "m.sc"

                ]

            ):

                current["degree"] = line

            elif re.search(r"\d{4}", line):

                current["year"] = line

            elif "cgpa" in line.lower():

                current["cgpa"] = line

        if current:

            education.append(current)

        return education
        # ---------------------------------------------------------

    def extract_experience(self, sections):

        keys = [
            "experience",
            "internship",
            "internship experience",
            "work experience"
        ]

        content = None

        for key in keys:
            if key in sections:
                content = sections[key]
                break

        if content is None:
            return []

        experiences = []

        current = None

        for line in self.lines(content):

            line = line.strip()

            if not line:
                continue

            if "—" in line or "-" in line:

                if current:
                    current["description"] = current["description"].strip()
                    experiences.append(current)

                parts = re.split(r"\s+[-—]\s+", line)

                role = parts[0].strip()

                company = ""

                if len(parts) > 1:
                    company = parts[1].strip()

                current = {
                    "role": role,
                    "company": company,
                    "description": ""
                }

            else:

                if current:
                    current["description"] += line + " "

        if current:
            current["description"] = current["description"].strip()
            experiences.append(current)

        return experiences
            # ---------------------------------------------------------

    def extract_certifications(self, sections):

        if "certifications" not in sections:

            return []

        certs = []

        for line in sections["certifications"].split("\n"):

            line = line.lstrip("•-* ").strip()

            if line:
                certs.append(line)

        return certs
        # ---------------------------------------------------------

    def extract_achievements(self, sections):

        keys = [
            "achievements",
            "achievements & awards",
            "awards"
        ]

        content = None

        for key in keys:
            if key in sections:
                content = sections[key]
                break

        if content is None:
            return []

        achievements = []

        for line in self.lines(content):

            line = line.strip()

            if not line:
                continue

            line = line.lstrip("•-* ")

            if len(line) > 3:
                achievements.append(line)

        return achievements
    # ---------------------------------------------------------

    def extract_projects(self, sections):

        if "projects" not in sections:
            return []

        lines = self.lines(sections["projects"])

        projects = []

        i = 0

        while i < len(lines):

            title = lines[i].strip()
            if self._is_section_header(title):
                 break

            if len(title) < 3:
                i += 1
                continue

            technologies = []

            description = []

            # Technology line
            if i + 1 < len(lines) and "|" in lines[i + 1]:

                technologies = self.skill_extractor.extract(lines[i + 1])

                i += 2

            else:

                i += 1

            while i < len(lines):

                line = lines[i].strip()

                if not line:
                    i += 1
                    continue

                # Next project starts
                if (
                    i + 1 < len(lines)
                    and "|" in lines[i+1] and len(lines)>5
                ):
                    break

                description.append(line)

                i += 1

            technologies.extend(

                self.skill_extractor.extract(

                    title + " " + " ".join(description)

                )

            )

            projects.append({

                "title": title,

                "description": " ".join(description),

                "technologies": sorted(set(technologies))

            })

        return projects
    # ---------------------------------------------------------

    def project_skills(self, projects):

        skills = set()

        for project in projects:

            for skill in project["technologies"]:

                skills.add(skill)

        return skills
    # ---------------------------------------------------------

    def certification_skills(self, certifications):

        skills = set()

        for cert in certifications:

            found = self.skill_extractor.extract(cert)

            skills.update(found)

        return skills
    # ---------------------------------------------------------

    def achievement_skills(self, achievements):

        skills = set()

        for achievement in achievements:

            found = self.skill_extractor.extract(achievement)

            skills.update(found)

        return skills
    # ---------------------------------------------------------

    def experience_skills(self, experiences):

        skills = set()

        for experience in experiences:

            text = ""

            text += experience.get("role", "") + " "

            text += experience.get("company", "") + " "

            text += experience.get("description", "")

            found = self.skill_extractor.extract(text)

            skills.update(found)

        return skills
    # ---------------------------------------------------------

    def extract_profile(self, text):

        # Extract all resume sections
        sections = self.extract_sections(text)

        # Structured information
        education = self.extract_education(sections)

        projects = self.extract_projects(sections)

        experience = self.extract_experience(sections)

        certifications = self.extract_certifications(sections)

        achievements = self.extract_achievements(sections)

        # -----------------------------
        # Build Complete Skill Set
        # -----------------------------

        skills = set()

        # Skills from entire resume
        

# 1. Extract from the explicit Skills section first
        if "skills" in sections:
            skills.update(
                self.skill_extractor.extract(sections["skills"])
            )

        # 2. Then extract from the whole resume
        skills.update(
            self.skill_extractor.extract(text)
        )

        # Skills from Projects
        skills.update(
            self.project_skills(projects)
        )

        # Skills from Certifications
        skills.update(
            self.certification_skills(certifications)
        )

        # Skills from Achievements
        skills.update(
            self.achievement_skills(achievements)
        )

        # Skills from Experience
        skills.update(
            self.experience_skills(experience)
        )

        profile = {

            "name": self.extract_name(text),

            "email": self.extract_email(text),

            "phone": self.extract_phone(text),

            "college": self.extract_college(text),

            "degree": self.extract_degree(text),

            "cgpa": self.extract_cgpa(text),

            "education": education,

            "projects": projects,

            "experience": experience,

            "certifications": certifications,

            "achievements": achievements,

            "skills": sorted(skills),

            "preferred_domain": None

        }

        return profile



                            