"""
Internship Text Builder

Author: Internship Intelligence Platform

Description:
Creates a rich natural language representation of every internship.
The generated text is later converted into vector embeddings.

This module should ONLY build text.
It should NOT perform embedding generation.
"""

from __future__ import annotations

import pandas as pd


class InternshipTextBuilder:

    def __init__(self, dataframe: pd.DataFrame):
        self.df = dataframe.copy()

    # ------------------------------------------------------------

    @staticmethod
    def _format_list(value):

        if isinstance(value, list):
            return ", ".join(value)

        if pd.isna(value):
            return ""

        return str(value)

    # ------------------------------------------------------------

    def build_text(self) -> pd.DataFrame:

        internship_texts = []

        for _, row in self.df.iterrows():

            role = row.get("Normalized Role", "")
            company = row.get("Company Name", "")
            location = row.get("Location", "")
            duration = row.get("Duration", "")
            stipend = row.get("Average Stipend", "")
            internship_type = row.get("Intern Type", "")
            skills = self._format_list(
                row.get("Normalized Skills", [])
            )
            perks = self._format_list(
                row.get("Perks", [])
            )

            text = f"""
Role: {role}

Company: {company}

Location: {location}

Duration: {duration}

Internship Type: {internship_type}

Required Skills: {skills}

Perks: {perks}

Monthly Stipend: {stipend}
"""

            internship_texts.append(
                " ".join(text.split())
            )

        self.df["Internship Text"] = internship_texts

        return self.df