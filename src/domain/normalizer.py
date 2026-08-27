"""
Domain Normalizer

Author : Internship Intelligence Platform

Description
-----------
ONE canonical implementation for turning a free-form domain string
("ai", "AI/ML", "Artificial Intelligence", "backend", "full-stack", ...)
into the canonical domain label actually used in the training dataset
and internship dataset (Domain column).

This is the single source of truth for domain-name normalization.
It is used by:
    - Domain prediction output        (src/domain/predict.py)
    - Domain-based recommendation     (GET /recommend/domain/{domain})
    - Manual internship search        (GET /internships/search, domain filter)

It intentionally does NOT duplicate src/preprocessing/domain_mapping.json,
which solves a different problem (mapping a raw JOB ROLE string to a
domain during dataset construction). This module maps a domain NAME
(or alias of one) to the canonical domain label already present in the
dataset — a smaller, different lookup.
"""

from __future__ import annotations

import re

from src.utils.logger import logger

# Canonical domain labels, as they actually appear in the dataset's
# `Domain` column (see data/final/training_dataset_domain.csv).
CANONICAL_DOMAINS: list[str] = [
    "Artificial Intelligence",
    "Machine Learning",
    "Data Science",
    "Backend Development",
    "Frontend Development",
    "Full Stack Development",
    "Mobile Development",
    "DevOps",
    "Cloud Computing",
    "Cyber Security",
    "QA Testing",
    "UI UX",
    "Digital Marketing",
    "Business Development",
    "Content Writing",
    "Graphic Design",
    "Human Resources",
    "Video Editing",
    "Customer Support",
    "Finance",
    "Operations",
    "Education",
    "Others",
]

# Alias -> canonical domain. Keys are matched case-insensitively after
# stripping punctuation/whitespace (see _clean()).
_ALIASES: dict[str, str] = {
    # Artificial Intelligence
    "ai": "Artificial Intelligence",
    "aiml": "Artificial Intelligence",
    "artificialintelligence": "Artificial Intelligence",
    "genai": "Artificial Intelligence",
    "generativeai": "Artificial Intelligence",
    "llm": "Artificial Intelligence",
    # Machine Learning
    "ml": "Machine Learning",
    "machinelearning": "Machine Learning",
    # Data Science
    "ds": "Data Science",
    "datascience": "Data Science",
    "dataanalytics": "Data Science",
    "dataanalysis": "Data Science",
    # Backend
    "backend": "Backend Development",
    "backenddevelopment": "Backend Development",
    "serversidedevelopment": "Backend Development",
    "serverside": "Backend Development",
    "pythondevelopment": "Backend Development",
    "python": "Backend Development",
    # Frontend
    "frontend": "Frontend Development",
    "frontenddevelopment": "Frontend Development",
    "clientsidedevelopment": "Frontend Development",
    # Full Stack
    "fullstack": "Full Stack Development",
    "fullstackdevelopment": "Full Stack Development",
    "mern": "Full Stack Development",
    "mean": "Full Stack Development",
    # Mobile
    "mobile": "Mobile Development",
    "mobiledevelopment": "Mobile Development",
    "android": "Mobile Development",
    "ios": "Mobile Development",
    "appdevelopment": "Mobile Development",
    # DevOps
    "devops": "DevOps",
    # Cloud
    "cloud": "Cloud Computing",
    "cloudcomputing": "Cloud Computing",
    # Cyber Security
    "cybersecurity": "Cyber Security",
    "security": "Cyber Security",
    "infosec": "Cyber Security",
    # QA
    "qa": "QA Testing",
    "qatesting": "QA Testing",
    "testing": "QA Testing",
    "softwaretesting": "QA Testing",
    # UI UX
    "uiux": "UI UX",
    "uxui": "UI UX",
    "ui": "UI UX",
    "ux": "UI UX",
    "productdesign": "UI UX",
    # Digital Marketing
    "digitalmarketing": "Digital Marketing",
    "marketing": "Digital Marketing",
    "seo": "Digital Marketing",
    # Business Development
    "businessdevelopment": "Business Development",
    "sales": "Business Development",
    "bd": "Business Development",
    # Content Writing
    "contentwriting": "Content Writing",
    "contentcreation": "Content Writing",
    "copywriting": "Content Writing",
    # Graphic Design
    "graphicdesign": "Graphic Design",
    "design": "Graphic Design",
    # Human Resources
    "hr": "Human Resources",
    "humanresources": "Human Resources",
    # Video Editing
    "videoediting": "Video Editing",
    "videoproduction": "Video Editing",
    # Customer Support
    "customersupport": "Customer Support",
    "customerservice": "Customer Support",
    # Finance
    "finance": "Finance",
    "accounting": "Finance",
    # Operations
    "operations": "Operations",
    "ops": "Operations",
    # Education
    "education": "Education",
    "teaching": "Education",
}

# Canonical labels are always valid targets of themselves.
for _label in CANONICAL_DOMAINS:
    _ALIASES.setdefault(re.sub(r"[^a-z0-9]", "", _label.lower()), _label)


def _clean(value: str) -> str:
    """Lowercase and strip everything except letters/digits, so
    'Full-Stack', 'full stack', 'FullStack' all collapse to the same key."""

    return re.sub(r"[^a-z0-9]", "", value.strip().lower())


def normalize_domain(domain: str) -> str:
    """
    Normalize a free-form domain string to the canonical dataset label.

    Falls back to a substring match against known aliases, then to the
    original (title-cased) input if nothing matches, so callers can
    still surface a "no internships found" response rather than crash.
    """

    if not domain or not domain.strip():
        return "Others"

    key = _clean(domain)

    if key in _ALIASES:
        return _ALIASES[key]

    # Substring fallback for compound phrases like "ai intern role" or
    # "backend developer position". Only applied to sufficiently long,
    # specific aliases (>= 4 chars) to avoid short aliases like "ai" or
    # "ux" spuriously matching inside unrelated words (e.g. "domain").
    for alias, canonical in _ALIASES.items():
        if len(alias) >= 4 and alias in key:
            return canonical

    logger.warning(f"normalize_domain: no match for '{domain}', using as-is")
    return domain.strip().title()
