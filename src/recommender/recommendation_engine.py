"""
Recommendation Engine

Author : Internship Intelligence Platform

Description
-----------
Ranks internships using

1. Semantic Similarity (Sentence Transformers)
2. Skill Overlap
3. Preferred Domain Filter

Output:
Top K internships with

- similarity score
- matched skills
- missing skills
- final score
"""

from __future__ import annotations

import ast
from pathlib import Path

import numpy as np
import pandas as pd

from sklearn.metrics.pairwise import cosine_similarity
from src.recommender.skill_gap_analyzer import SkillGapAnalyzer
from src.models.embedding_model import EmbeddingModel
from src.utils.logger import logger


class RecommendationEngine:

    def __init__(
        self,
        dataset_path: str,
        embedding_path: str,
        index_path: str
    ):

        self.dataset_path = Path(dataset_path)
        self.embedding_path = Path(embedding_path)
        self.index_path = Path(index_path)
        self.skill_gap = SkillGapAnalyzer()
        logger.info("=" * 70)
        logger.info("Loading Recommendation Engine")
        logger.info("=" * 70)

        self.dataset = pd.read_csv(self.dataset_path)

        self.embeddings = np.load(self.embedding_path)

        self.index = pd.read_csv(self.index_path)

        self.embedding_model = EmbeddingModel()

        logger.info(
            f"Dataset Loaded : {len(self.dataset)} internships"
        )

        logger.info(
            f"Embeddings Shape : {self.embeddings.shape}"
        )

    # ---------------------------------------------------------

    def create_student_embedding(
        self,
        profile_text: str
    ) -> np.ndarray:

        embedding = self.embedding_model.encode(
            [profile_text],
            show_progress=False
        )

        return embedding

    # ---------------------------------------------------------

    def compute_similarity(
        self,
        student_embedding: np.ndarray
    ) -> np.ndarray:

        similarity = cosine_similarity(
            student_embedding,
            self.embeddings
        )[0]

        return similarity

    # ---------------------------------------------------------

    def parse_skills(
        self,
        skills
    ) -> list[str]:

        if pd.isna(skills):
            return []

        if isinstance(skills, list):
            return skills

        if isinstance(skills, str):

            try:

                parsed = ast.literal_eval(skills)

                if isinstance(parsed, list):

                    return [
                        str(skill).strip()
                        for skill in parsed
                    ]

            except Exception:

                return [
                    skill.strip()
                    for skill in skills.split(",")
                    if skill.strip()
                ]

        return []

    # ---------------------------------------------------------

    
    # ---------------------------------------------------------

    def apply_domain_filter(
        self,
        dataframe: pd.DataFrame,
        preferred_domain: str | None
    ) -> pd.DataFrame:

        if preferred_domain is None:

            return dataframe

        filtered = dataframe[
            dataframe["Domain"]
            .str.lower()
            ==
            preferred_domain.lower()
        ]

        if len(filtered) >= 10:

            logger.info("=" * 60)
            logger.info(f"Preferred Domain Received = {preferred_domain}")
            logger.info("=" * 60)

            return filtered.reset_index(drop=True)

        logger.info(
            "Insufficient internships after domain filter."
        )

        logger.info(
            "Using complete dataset instead."
        )

        return dataframe
        # ---------------------------------------------------------

    def recommend(
        self,
        student_text: str,
        student_skills: list[str],
        preferred_domain: str | None = None,
        top_k: int = 10,
        semantic_weight: float = 0.7,
        skill_weight: float = 0.3,
    ) -> pd.DataFrame:

        logger.info("=" * 70)
        logger.info("Generating Internship Recommendations")
        logger.info("=" * 70)

        # -------------------------------------------------
        # Student Embedding
        # -------------------------------------------------

        student_embedding = self.create_student_embedding(
            student_text
        )

        similarity_scores = self.compute_similarity(
            student_embedding
        )

        # -------------------------------------------------
        # Copy Dataset
        # -------------------------------------------------

        recommendations = self.dataset.copy()

        recommendations["semantic_score"] = similarity_scores

        # -------------------------------------------------
        # Domain Filter
        # -------------------------------------------------

        recommendations = self.apply_domain_filter(
            recommendations,
            preferred_domain
        )

        # -------------------------------------------------
        # Skill Matching
        # -------------------------------------------------

        overlap_scores = []

        matched_list = []

        missing_list = []

        resource_list = []

        recommendation_level = []
        for _, row in recommendations.iterrows():

            internship_skills = self.parse_skills(

                row["Normalized Skills"]

            )

            overlap, matched, missing = self.skill_gap.skill_overlap_score(
            student_skills,
            internship_skills
        )

            overlap_scores.append(overlap)

            matched_list.append(matched)

            missing_list.append(missing)

            resource_list.append(
            self.skill_gap.learning_resources(missing)
        )

            recommendation_level.append(
                self.skill_gap.recommendation_level(overlap)
            )   
        recommendations["skill_overlap"] = overlap_scores

        recommendations["matched_skills"] = matched_list

        recommendations["missing_skills"] = missing_list

        recommendations["learning_resources"] = resource_list

        recommendations["recommendation_level"] = recommendation_level

        # -------------------------------------------------
        # Final Ranking Score
        # -------------------------------------------------

        recommendations["final_score"] = (
            semantic_weight * recommendations["semantic_score"]
            +
            skill_weight * recommendations["skill_overlap"]
        )

        recommendations = recommendations.sort_values(
            by="final_score",
            ascending=False
        ).reset_index(drop=True)

        logger.info(
            f"Top {top_k} Recommendations Generated"
        )

        # -------------------------------------------------
        # Return Important Columns
        # -------------------------------------------------

        columns = [

        "Role",

    "Company Name",

    "Location",

    "Duration",

    "Stipend",

    "Average Stipend",

    "Domain",

    "Normalized Skills",

    "semantic_score",

    "skill_overlap",

    "final_score",

    "recommendation_level",

    "matched_skills",

    "missing_skills",

    "learning_resources",

    "Website Link"

    ]

        columns = [
            column
            for column in columns
            if column in recommendations.columns
        ]

        return recommendations.loc[
            : top_k - 1,
            columns
        ]