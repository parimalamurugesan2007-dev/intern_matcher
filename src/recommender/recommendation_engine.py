"""
Recommendation Engine

Author : Internship Intelligence Platform

Description:
Ranks internships using three signals:

    40 % Semantic Similarity  (Sentence Transformers + cosine similarity)
    40 % Skill Match          (overlap between student and internship skills)
    20 % Domain Match         (1.0 if same domain, else 0.0)

Output — Top K internships with:
    - Role
    - Company
    - Location
    - Duration
    - Stipend
    - Domain
    - Matched Skills
    - Missing Skills
    - Skill Match %
    - Learning Resources
    - Recommendation Level
    - Semantic Score
    - Final Score
    - Website Link
"""

from __future__ import annotations

import ast
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

from src.config.settings import settings
from src.models.embedding_model import EmbeddingModel
from src.recommender.skill_gap_analyzer import SkillGapAnalyzer
from src.utils.logger import logger


class RecommendationEngine:
    """Loads dataset + embeddings once, reuses them for every request."""

    def __init__(
        self,
        dataset_path: str = settings.DATASET_PATH,
        embedding_path: str = settings.EMBEDDING_PATH,
        index_path: str = settings.EMBEDDING_INDEX_PATH,
    ) -> None:
        self.dataset_path = Path(dataset_path)
        self.embedding_path = Path(embedding_path)
        self.index_path = Path(index_path)

        self.skill_gap = SkillGapAnalyzer()
        self.embedding_model = EmbeddingModel()

        logger.info("=" * 70)
        logger.info("Loading Recommendation Engine")
        logger.info("=" * 70)

        self.dataset = pd.read_csv(self.dataset_path)
        self.embeddings = np.load(self.embedding_path)
        self.index = pd.read_csv(self.index_path)

        logger.info(f"Dataset loaded : {len(self.dataset)} internships")
        logger.info(f"Embeddings shape : {self.embeddings.shape}")

    # ---------------------------------------------------------
    # Embedding helpers
    # ---------------------------------------------------------

    def create_student_embedding(self, profile_text: str) -> np.ndarray:
        embedding = self.embedding_model.encode([profile_text], show_progress=False)
        return embedding

    def compute_similarity(self, student_embedding: np.ndarray) -> np.ndarray:
        return cosine_similarity(student_embedding, self.embeddings)[0]

    # ---------------------------------------------------------
    # Skill parsing
    # ---------------------------------------------------------

    @staticmethod
    def parse_skills(skills: Any) -> list[str]:
        """Parse a skills field that may be a list, stringified list, or comma-separated string."""

        if pd.isna(skills):
            return []

        if isinstance(skills, list):
            return [str(s).strip() for s in skills if str(s).strip()]

        if isinstance(skills, str):
            try:
                parsed = ast.literal_eval(skills)
                if isinstance(parsed, list):
                    return [str(s).strip() for s in parsed if str(s).strip()]
            except Exception:
                return [s.strip() for s in skills.split(",") if s.strip()]

        return []

    # ---------------------------------------------------------
    # Domain filter
    # ---------------------------------------------------------

    def apply_domain_filter(
        self,
        dataframe: pd.DataFrame,
        preferred_domain: str | None,
    ) -> pd.DataFrame:
        """
        Filter to the preferred domain when enough internships exist.
        Falls back to the full dataset when fewer than 10 matches are found.
        """

        if preferred_domain is None:
            return dataframe

        filtered = dataframe[
            dataframe["Domain"].str.lower() == preferred_domain.lower()
        ]

        if len(filtered) >= 10:
            logger.info(f"Preferred domain filter applied: {preferred_domain} ({len(filtered)} rows)")
            return filtered.reset_index(drop=True)

        logger.info(
            f"Insufficient internships after domain filter ({len(filtered)} rows). "
            "Using complete dataset instead."
        )
        return dataframe

    # ---------------------------------------------------------
    # Domain match score (0 or 1)
    # ---------------------------------------------------------

    @staticmethod
    def _domain_match_score(row_domain: Any, preferred_domain: str | None) -> float:
        """Return 1.0 if the internship domain matches the preferred domain, else 0.0."""

        if preferred_domain is None or pd.isna(row_domain):
            return 0.0
        return 1.0 if str(row_domain).lower() == preferred_domain.lower() else 0.0

    # ---------------------------------------------------------
    # Main recommendation
    # ---------------------------------------------------------

    def recommend(
        self,
        student_text: str,
        student_skills: list[str],
        preferred_domain: str | None = None,
        top_k: int = 10,
        semantic_weight: float = settings.SEMANTIC_WEIGHT,
        skill_weight: float = settings.SKILL_WEIGHT,
        domain_weight: float = settings.DOMAIN_WEIGHT,
    ) -> pd.DataFrame:
        """
        Generate ranked internship recommendations.

        Ranking formula:
            final_score = 0.40 * semantic_score
                        + 0.40 * skill_overlap
                        + 0.20 * domain_match
        """

        logger.info("=" * 70)
        logger.info("Generating Internship Recommendations")
        logger.info("=" * 70)

        # --- Student embedding & semantic similarity ---
        student_embedding = self.create_student_embedding(student_text)
        similarity_scores = self.compute_similarity(student_embedding)

        # --- Copy dataset ---
        recommendations = self.dataset.copy()
        recommendations["semantic_score"] = similarity_scores

        # --- Domain filter ---
        recommendations = self.apply_domain_filter(recommendations, preferred_domain)

        # --- Skill matching ---
        overlap_scores: list[float] = []
        matched_list: list[list[str]] = []
        missing_list: list[list[str]] = []
        resource_list: list[dict[str, Any]] = []
        recommendation_level: list[str] = []
        skill_match_pct: list[float] = []
        domain_match_scores: list[float] = []

        for _, row in recommendations.iterrows():
            internship_skills = self.parse_skills(row["Normalized Skills"])

            overlap, matched, missing = self.skill_gap.skill_overlap_score(
                student_skills, internship_skills
            )

            overlap_scores.append(overlap)
            matched_list.append(matched)
            missing_list.append(missing)
            resource_list.append(self.skill_gap.learning_resources(missing))
            recommendation_level.append(self.skill_gap.recommendation_level(overlap))
            skill_match_pct.append(round(overlap * 100, 1))
            domain_match_scores.append(self._domain_match_score(row.get("Domain"), preferred_domain))

        recommendations["skill_overlap"] = overlap_scores
        recommendations["matched_skills"] = matched_list
        recommendations["missing_skills"] = missing_list
        recommendations["learning_resources"] = resource_list
        recommendations["recommendation_level"] = recommendation_level
        recommendations["skill_match_pct"] = skill_match_pct
        recommendations["domain_match"] = domain_match_scores

        # --- Final ranking score ---
        recommendations["final_score"] = (
            semantic_weight * recommendations["semantic_score"]
            + skill_weight * recommendations["skill_overlap"]
            + domain_weight * recommendations["domain_match"]
        )

        recommendations = recommendations.sort_values(
            by="final_score", ascending=False
        ).reset_index(drop=True)

        logger.info(f"Top {top_k} recommendations generated")

        # --- Return important columns ---
        columns = [
            "Role",
            "Company Name",
            "Location",
            "Duration",
            "Stipend",
            "Average Stipend",
            "Domain",
            "Normalized Skills",
            "matched_skills",
            "missing_skills",
            "skill_match_pct",
            "learning_resources",
            "recommendation_level",
            "semantic_score",
            "final_score",
            "Website Link",
        ]

        columns = [c for c in columns if c in recommendations.columns]

        return recommendations.loc[: top_k - 1, columns]

    # ---------------------------------------------------------
    # Domain-specific recommendation
    # ---------------------------------------------------------

    def recommend_by_domain(
        self,
        domain: str,
        top_k: int = 10,
    ) -> pd.DataFrame:
        """Return internships belonging to a specific domain."""

        logger.info(f"Domain-specific recommendation requested: {domain}")

        filtered = self.dataset[
            self.dataset["Domain"].str.lower() == domain.lower()
        ]

        if filtered.empty:
            logger.info(f"No internships found for domain: {domain}")
            return pd.DataFrame()

        filtered = filtered.reset_index(drop=True)

        columns = [
            "Role",
            "Company Name",
            "Location",
            "Duration",
            "Stipend",
            "Average Stipend",
            "Domain",
            "Normalized Skills",
            "Website Link",
        ]

        columns = [c for c in columns if c in filtered.columns]

        return filtered.loc[: top_k - 1, columns]

    # ---------------------------------------------------------
    # Manual search
    # ---------------------------------------------------------

    def search_internships(
        self,
        location: str | None = None,
        domain: str | None = None,
        mode: str | None = None,
        duration: str | None = None,
        stipend: str | None = None,
        company: str | None = None,
        skills: str | None = None,
        keyword: str | None = None,
        top_k: int = 50,
    ) -> pd.DataFrame:
        """
        Search the internship dataset with multiple filters.

        All non-None filters are combined with AND logic.
        Text filters use case-insensitive substring matching.
        """

        df = self.dataset.copy()

        # Location
        if location:
            if "Location" in df.columns:
                df = df[df["Location"].fillna("").str.lower().str.contains(location.lower())]

        # Domain
        if domain:
            if "Domain" in df.columns:
                df = df[df["Domain"].fillna("").str.lower().str.contains(domain.lower())]

        # Mode (Intern Type)
        if mode:
            mode_col = "Intern Type" if "Intern Type" in df.columns else None
            if mode_col:
                df = df[df[mode_col].fillna("").str.lower().str.contains(mode.lower())]

        # Duration
        if duration:
            if "Duration" in df.columns:
                df = df[df["Duration"].fillna("").str.lower().str.contains(duration.lower())]

        # Stipend
        if stipend:
            stipend_col = "Average Stipend" if "Average Stipend" in df.columns else "Stipend"
            if stipend_col in df.columns:
                df = df[df[stipend_col].astype(str).fillna("").str.lower().str.contains(stipend.lower())]

        # Company
        if company:
            if "Company Name" in df.columns:
                df = df[df["Company Name"].fillna("").str.lower().str.contains(company.lower())]

        # Skills
        if skills:
            if "Normalized Skills" in df.columns:
                skill_terms = [s.strip().lower() for s in skills.split(",") if s.strip()]
                mask = pd.Series([False] * len(df), index=df.index)
                for term in skill_terms:
                    mask |= df["Normalized Skills"].fillna("").str.lower().str.contains(term)
                df = df[mask]

        # Keyword (search across Role, Company Name, Skills)
        if keyword:
            keyword = keyword.lower()
            mask = pd.Series([False] * len(df), index=df.index)
            for col in ["Role", "Company Name", "Normalized Skills", "Location"]:
                if col in df.columns:
                    mask |= df[col].fillna("").str.lower().str.contains(keyword)
            df = df[mask]

        df = df.reset_index(drop=True)

        columns = [
            "Role",
            "Company Name",
            "Location",
            "Duration",
            "Stipend",
            "Average Stipend",
            "Domain",
            "Normalized Skills",
            "Website Link",
        ]
        columns = [c for c in columns if c in df.columns]

        return df.loc[: top_k - 1, columns]
