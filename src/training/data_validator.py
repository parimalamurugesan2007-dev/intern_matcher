"""
Training Data Validator

Author : Internship Intelligence Platform

Description:
Validates the domain-classifier training dataset
(data/final/training_dataset_domain.csv) BEFORE training starts.

Checks performed:
    - Required columns present (Skills, Domain)
    - Dataset is non-empty
    - No fully missing Skills / Domain values
    - No duplicate rows
    - No empty / whitespace-only training examples
    - No domain labels with too few examples to stratify-split

Training must fail loudly (raise) when validation fails, so a
corrupted or incomplete dataset can never silently produce a
broken model.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import pandas as pd

from src.utils.logger import logger

REQUIRED_COLUMNS: list[str] = ["Skills", "Domain"]
MIN_EXAMPLES_PER_CLASS: int = 2  # sklearn stratify needs >= 2 per class


class TrainingDataValidationError(Exception):
    """Raised when the training dataset fails validation."""


@dataclass
class ValidationReport:
    rows: int = 0
    missing_values: dict[str, int] = field(default_factory=dict)
    duplicate_rows: int = 0
    empty_skill_examples: int = 0
    invalid_domain_rows: int = 0
    low_support_classes: dict[str, int] = field(default_factory=dict)

    def as_dict(self) -> dict:
        return {
            "rows": self.rows,
            "missing_values": self.missing_values,
            "duplicate_rows": self.duplicate_rows,
            "empty_skill_examples": self.empty_skill_examples,
            "invalid_domain_rows": self.invalid_domain_rows,
            "low_support_classes": self.low_support_classes,
        }


class TrainingDataValidator:
    """Validates the domain-classifier training dataframe before use."""

    def __init__(self, dataframe: pd.DataFrame) -> None:
        self.df = dataframe

    # ---------------------------------------------------------

    def validate_required_columns(self) -> None:
        missing = [c for c in REQUIRED_COLUMNS if c not in self.df.columns]
        if missing:
            raise TrainingDataValidationError(f"Missing required columns: {missing}")

    # ---------------------------------------------------------

    def validate_not_empty(self) -> None:
        if self.df.empty:
            raise TrainingDataValidationError("Training dataset is empty.")

    # ---------------------------------------------------------

    def validate_missing_values(self) -> dict[str, int]:
        return {col: int(self.df[col].isna().sum()) for col in REQUIRED_COLUMNS}

    # ---------------------------------------------------------

    def validate_duplicates(self) -> int:
        return int(self.df.duplicated(subset=REQUIRED_COLUMNS).sum())

    # ---------------------------------------------------------

    def validate_empty_training_examples(self) -> int:
        empty_mask = self.df["Skills"].fillna("").astype(str).str.strip().eq("")
        return int(empty_mask.sum())

    # ---------------------------------------------------------

    def validate_invalid_domains(self) -> int:
        invalid_mask = self.df["Domain"].fillna("").astype(str).str.strip().eq("")
        return int(invalid_mask.sum())

    # ---------------------------------------------------------

    def validate_class_support(self) -> dict[str, int]:
        counts = self.df["Domain"].value_counts()
        low_support = counts[counts < MIN_EXAMPLES_PER_CLASS]
        return {str(k): int(v) for k, v in low_support.items()}

    # ---------------------------------------------------------

    def run(self, strict: bool = True) -> ValidationReport:
        """
        Run all validation checks.

        If *strict* is True, raise TrainingDataValidationError on any
        hard failure (missing columns, empty dataset, fully-missing
        required fields). Row-level issues (duplicates, empty
        examples, low-support classes) are reported but only block
        training if they make the dataset unusable.
        """

        logger.info("=" * 60)
        logger.info("Validating Training Dataset")
        logger.info("=" * 60)

        self.validate_required_columns()
        self.validate_not_empty()

        report = ValidationReport(rows=int(len(self.df)))
        report.missing_values = self.validate_missing_values()
        report.duplicate_rows = self.validate_duplicates()
        report.empty_skill_examples = self.validate_empty_training_examples()
        report.invalid_domain_rows = self.validate_invalid_domains()
        report.low_support_classes = self.validate_class_support()

        for column, count in report.missing_values.items():
            if count > 0:
                logger.warning(f"Column '{column}' has {count} missing values")

        if report.duplicate_rows > 0:
            logger.warning(f"Found {report.duplicate_rows} duplicate rows")

        if report.empty_skill_examples > 0:
            logger.warning(f"Found {report.empty_skill_examples} empty skill examples")

        if report.invalid_domain_rows > 0:
            logger.warning(f"Found {report.invalid_domain_rows} rows with invalid/empty domain labels")

        if report.low_support_classes:
            logger.warning(f"Low-support domain classes (< {MIN_EXAMPLES_PER_CLASS} examples): {report.low_support_classes}")

        usable_rows = report.rows - report.missing_values.get("Skills", 0) - report.missing_values.get("Domain", 0)
        if usable_rows <= 0 and strict:
            raise TrainingDataValidationError(
                "No usable rows remain after removing missing Skills/Domain values."
            )

        logger.info(f"Validation complete. Usable rows: {usable_rows}/{report.rows}")

        return report
