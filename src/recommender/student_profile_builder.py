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
                " ".join(projects)
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