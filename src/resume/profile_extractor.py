"""
Advanced Resume Profile Extractor

Internship Intelligence Platform

Extracts:
    - Basic Information (name, email, phone, college, degree, cgpa)
    - Education
    - Projects
    - Experience / Internships
    - Certifications
    - Achievements
    - Skills  (merged from ALL sections, de-duplicated, normalised)

Skills are extracted from the entire resume — Skills, Projects,
Experience, Internships, Certifications and Achievements — then
merged into one final, normalised, de-duplicated list.
"""

from __future__ import annotations

import re
from typing import Any

from src.resume.skill_extractor import SkillExtractor
from src.utils.header_matcher import detect_header
from src.utils.logger import logger


class ProfileExtractor:
    """Extracts a structured profile dict from raw resume text."""

    def __init__(self) -> None:
        self.skill_extractor = SkillExtractor()

        self.section_headers: dict[str, list[str]] = {
            "education": [
                "education",
                "academic background",
                "academic qualification",
                "qualification",
            ],
            "projects": [
                "PROJECTS",
                "projects",
                "academic projects",
                "project experience",
            ],
            "experience": [
                "INTERNSHIP EXPERIENCE",
                "experience",
                "work experience",
                "internship",
                "internships",
                "professional experience",
            ],
            "certifications": [
                "certifications",
                "certificates",
                "licenses",
                "courses",
            ],
            "achievements": [
                "achievements",
                "awards",
                "honors",
                "accomplishments",
                "hackathons",
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
                "tools",
            ],
        }

    # ---------------------------------------------------------
    # Text helpers
    # ---------------------------------------------------------

    @staticmethod
    def clean(text: str) -> str:
        return re.sub(r"\s+", " ", text).strip()

    @staticmethod
    def lines(text: str) -> list[str]:
        return [line.strip() for line in text.split("\n") if line.strip()]

    # ---------------------------------------------------------
    # Basic info
    # ---------------------------------------------------------

    def extract_name(self, text: str) -> str:
        lines = self.lines(text)
        return lines[0] if lines else ""

    def extract_email(self, text: str) -> str:
        match = re.search(
            r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
            text,
        )
        return match.group(0) if match else ""

    def extract_phone(self, text: str) -> str:
        match = re.search(
            r"(\+91[\s-]?)?[6-9]\d{9}",
            text.replace(" ", ""),
        )
        return match.group(0) if match else ""

    def extract_cgpa(self, text: str) -> float | None:
        patterns = [
            r"CGPA[: ]*([0-9]+(\.[0-9]+)?)",
            r"CGPA\s*[-:]\s*([0-9]+(\.[0-9]+)?)",
            r"Grade[: ]*([0-9]+(\.[0-9]+)?)",
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return float(match.group(1))
        return None

    def extract_degree(self, text: str) -> str:
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
            "M.Sc",
        ]

        for degree in degrees:
            if degree.lower() in text.lower():
                return degree
        return ""

    def extract_college(self, text: str) -> str:
        for line in self.lines(text):
            lower = line.lower()
            if "college" in lower or "institute" in lower or "university" in lower or "school" in lower:
                return line
        return ""

    # ---------------------------------------------------------
    # Section detection
    # ---------------------------------------------------------

    def _is_section_header(self, line: str) -> bool:
        return detect_header(line) is not None

    def extract_sections(self, text: str) -> dict[str, str]:
        lines = self.lines(text)
        sections: dict[str, str] = {}
        current: str | None = None
        buffer: list[str] = []

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
    # Structured section extractors
    # ---------------------------------------------------------

    def extract_education(self, sections: dict[str, str]) -> list[dict[str, Any]]:
        if "education" not in sections:
            return []

        education: list[dict[str, Any]] = []
        current: dict[str, Any] = {}

        for line in sections["education"].split("\n"):
            line = line.strip()
            if not line:
                continue

            if "college" in line.lower() or "institute" in line.lower() or "university" in line.lower():
                if current:
                    education.append(current)
                    current = {}
                current["institution"] = line
            elif any(
                degree.lower() in line.lower()
                for degree in ["b.tech", "b.e", "m.tech", "mba", "mca", "b.sc", "m.sc"]
            ):
                current["degree"] = line
            elif re.search(r"\d{4}", line):
                current["year"] = line
            elif "cgpa" in line.lower():
                current["cgpa"] = line

        if current:
            education.append(current)

        return education

    def extract_experience(self, sections: dict[str, str]) -> list[dict[str, Any]]:
        keys = ["experience", "internship", "internship experience", "work experience"]

        content: str | None = None
        for key in keys:
            if key in sections:
                content = sections[key]
                break

        if content is None:
            return []

        experiences: list[dict[str, Any]] = []
        current: dict[str, Any] | None = None

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
                current = {"role": role, "company": company, "description": ""}
            else:
                if current:
                    current["description"] += line + " "

        if current:
            current["description"] = current["description"].strip()
            experiences.append(current)

        return experiences

    def extract_certifications(self, sections: dict[str, str]) -> list[str]:
        if "certifications" not in sections:
            return []

        certs: list[str] = []
        for line in sections["certifications"].split("\n"):
            line = line.lstrip("•-* ").strip()
            if line:
                certs.append(line)
        return certs

    def extract_achievements(self, sections: dict[str, str]) -> list[str]:
        keys = ["achievements", "achievements & awards", "awards"]

        content: str | None = None
        for key in keys:
            if key in sections:
                content = sections[key]
                break

        if content is None:
            return []

        achievements: list[str] = []
        for line in self.lines(content):
            line = line.strip()
            if not line:
                continue
            line = line.lstrip("•-* ")
            if len(line) > 3:
                achievements.append(line)
        return achievements

    def extract_projects(self, sections: dict[str, str]) -> list[dict[str, Any]]:
        if "projects" not in sections:
            return []

        lines = self.lines(sections["projects"])
        projects: list[dict[str, Any]] = []
        i = 0

        while i < len(lines):
            title = lines[i].strip()
            if self._is_section_header(title):
                break

            if len(title) < 3:
                i += 1
                continue

            technologies: list[str] = []
            description: list[str] = []

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
                if i + 1 < len(lines) and "|" in lines[i + 1] and len(lines) > 5:
                    break
                description.append(line)
                i += 1

            technologies.extend(
                self.skill_extractor.extract(title + " " + " ".join(description))
            )

            projects.append({
                "title": title,
                "description": " ".join(description),
                "technologies": sorted(set(technologies)),
            })

        return projects

    # ---------------------------------------------------------
    # Section-level skill collectors
    # ---------------------------------------------------------

    def project_skills(self, projects: list[dict[str, Any]]) -> set[str]:
        skills: set[str] = set()
        for project in projects:
            skills.update(project["technologies"])
        return skills

    def certification_skills(self, certifications: list[str]) -> set[str]:
        skills: set[str] = set()
        for cert in certifications:
            skills.update(self.skill_extractor.extract(cert))
        return skills

    def achievement_skills(self, achievements: list[str]) -> set[str]:
        skills: set[str] = set()
        for achievement in achievements:
            skills.update(self.skill_extractor.extract(achievement))
        return skills

    def experience_skills(self, experiences: list[dict[str, Any]]) -> set[str]:
        skills: set[str] = set()
        for experience in experiences:
            text = (
                experience.get("role", "") + " "
                + experience.get("company", "") + " "
                + experience.get("description", "")
            )
            skills.update(self.skill_extractor.extract(text))
        return skills

    # ---------------------------------------------------------
    # Main entry point
    # ---------------------------------------------------------

    def extract_profile(self, text: str) -> dict[str, Any]:
        """
        Extract a structured profile from raw resume text.

        Skills are gathered from every resume section — Skills,
        Projects, Experience, Internships, Certifications and
        Achievements — then merged into one final, normalised,
        de-duplicated list.
        """

        sections = self.extract_sections(text)

        education = self.extract_education(sections)
        projects = self.extract_projects(sections)
        experience = self.extract_experience(sections)
        certifications = self.extract_certifications(sections)
        achievements = self.extract_achievements(sections)

        # --------------------------------------------------
        # Build the final skill set from every section
        # --------------------------------------------------

        skills: set[str] = set()

        # 1. Explicit Skills section
        if "skills" in sections:
            skills.update(self.skill_extractor.extract(sections["skills"]))

        # 2. Projects
        skills.update(self.project_skills(projects))

        # 3. Experience / Internships
        skills.update(self.experience_skills(experience))

        # 4. Certifications
        skills.update(self.certification_skills(certifications))

        # 5. Achievements
        skills.update(self.achievement_skills(achievements))

        # 6. Full resume text (catches anything missed by section parsing)
        skills.update(self.skill_extractor.extract(text))

        # Final normalised, de-duplicated list
        final_skills = self.skill_extractor.normalize_skill_list(sorted(skills))

        logger.info(f"Extracted {len(final_skills)} unique skills from resume")

        profile: dict[str, Any] = {
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
            "skills": final_skills,
            "preferred_domain": None,
        }

        return profile
