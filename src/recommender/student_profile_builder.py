"""
Student Profile Builder

Author : Internship Intelligence Platform

Description
-----------
Converts an extracted resume profile into a single text
representation for semantic embedding.

The generated text is later embedded using
SentenceTransformer.
"""

from __future__ import annotations


class StudentProfileBuilder:

    def __init__(self):
        pass

    # ---------------------------------------------------------

    @staticmethod
    def _project_to_text(project: object) -> str:
        """Flatten a single project entry into plain text.

        ``ProfileExtractor.extract_projects`` returns each project as a
        dict (title / technologies / description); older callers may
        still pass plain strings, so both shapes are supported here.
        """

        if isinstance(project, str):
            return project

        if isinstance(project, dict):
            fragments: list[str] = []

            title = project.get("title")
            if title:
                fragments.append(str(title))

            technologies = project.get("technologies")
            if technologies:
                fragments.append(" ".join(str(t) for t in technologies))

            description = project.get("description")
            if isinstance(description, list):
                fragments.append(" ".join(str(d) for d in description))
            elif description:
                fragments.append(str(description))

            return " ".join(fragments)

        return str(project)

    # ---------------------------------------------------------

    def build(self, profile: dict) -> str:

        parts = []

        # --------------------------
        # Skills
        # --------------------------

        skills = profile.get("skills", [])

        if skills:
            parts.append("Skills")
            parts.append(" ".join(skills))

        # --------------------------
        # Projects
        # --------------------------

        projects = profile.get("projects", [])

        if projects:

            parts.append("Projects")

            parts.append(
                " ".join(self._project_to_text(project) for project in projects)
            )

        # --------------------------
        # Degree
        # --------------------------

        degree = profile.get("degree")

        if degree:

            parts.append("Degree")

            parts.append(degree)

        # --------------------------
        # College
        # --------------------------

        college = profile.get("college")

        if college:

            parts.append("College")

            parts.append(college)

        # --------------------------
        # Preferred Domain
        # --------------------------

        domain = profile.get(
            "preferred_domain"
        )

        if domain:

            parts.append(
                "Preferred Domain"
            )

            parts.append(domain)

        return "\n".join(parts)