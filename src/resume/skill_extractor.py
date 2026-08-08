"""
Resume Skill Extractor

Author : Internship Intelligence Platform

Description:
Extracts skills from any block of resume text using the
knowledge-base skill dictionary (data/knowledge/skills.json).

Skills are normalised to their canonical form and returned
as a sorted, de-duplicated list.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from src.config.settings import settings
from src.utils.logger import logger


class SkillExtractor:
    """Dictionary-based skill matcher with text normalisation."""

    def __init__(self, dictionary_path: str = settings.SKILLS_DICTIONARY_PATH) -> None:
        path = Path(dictionary_path)
        if not path.exists():
            raise FileNotFoundError(f"Skills dictionary not found: {path}")

        with open(path, "r", encoding="utf-8") as f:
            self.skills: dict[str, str] = json.load(f)

        logger.info(f"Skill dictionary loaded : {len(self.skills)} entries")

    # ---------------------------------------------------------

    def preprocess(self, text: str) -> str:
        """Lower-case and strip punctuation that would break word-boundary regex."""

        text = text.lower()
        text = (
            text.replace(".", " ")
            .replace("-", " ")
            .replace("/", " ")
            .replace("_", " ")
        )
        text = re.sub(r"[^a-z0-9+# ]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    # ---------------------------------------------------------

    def extract(self, text: str) -> list[str]:
        """Return canonical, de-duplicated skills found in *text*."""

        if not text:
            return []

        processed = self.preprocess(text)
        found: set[str] = set()

        for key, canonical in self.skills.items():
            normalized_key = self.preprocess(key)
            if re.search(rf"\b{re.escape(normalized_key)}\b", processed):
                found.add(canonical)

        return sorted(found)

    # ---------------------------------------------------------

    def extract_from_sections(self, sections: dict[str, str]) -> list[str]:
        """Extract skills from every resume section at once and de-duplicate."""

        found: set[str] = set()

        for section_text in sections.values():
            found.update(self.extract(section_text))

        return sorted(found)

    # ---------------------------------------------------------

    def extract_from_dicts(self, items: list[dict[str, Any]], text_keys: list[str]) -> list[str]:
        """Extract skills from a list of structured dicts (projects, experience, etc.)."""

        found: set[str] = set()

        for item in items:
            for key in text_keys:
                value = item.get(key, "")
                if isinstance(value, list):
                    value = " ".join(str(v) for v in value)
                found.update(self.extract(str(value)))

        return sorted(found)

    # ---------------------------------------------------------

    def normalize_skill_list(self, skills: list[str]) -> list[str]:
        """Normalize and de-duplicate an already-extracted list of skills."""

        normalized: set[str] = set()
        for skill in skills:
            canonical = self.skills.get(skill.lower().strip())
            normalized.add(canonical if canonical else skill.strip().title())
        return sorted(normalized)
