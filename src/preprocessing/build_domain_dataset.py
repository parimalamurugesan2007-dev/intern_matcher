"""
Build Domain Training Dataset

Author : Internship Intelligence Platform

Description:
Takes the cleaned/processed internship dataset
(data/processed/internships_processed.csv) and maps each row's
"Normalized Role" to a Domain label using DomainMapper, producing
the dataset consumed by the domain classifier's training pipeline
and by the recommendation engine at inference time
(data/final/training_dataset_domain.csv).

Reproducible entry point:

    python -m src.preprocessing.build_domain_dataset
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from src.preprocessing.domain_mapper import DomainMapper
from src.utils.logger import logger

SOURCE_PATH = Path("data/processed/internships_processed.csv")
OUTPUT_PATH = Path("data/final/training_dataset_domain.csv")
DOMAIN_MAPPING_PATH = "src/preprocessing/domain_mapping.json"


def build(
    source_path: Path = SOURCE_PATH,
    output_path: Path = OUTPUT_PATH,
    mapping_path: str = DOMAIN_MAPPING_PATH,
) -> pd.DataFrame:
    logger.info("=" * 70)
    logger.info("Building Domain Training Dataset")
    logger.info("=" * 70)

    if not source_path.exists():
        raise FileNotFoundError(
            f"Processed dataset not found: {source_path}. Run the preprocessing "
            "pipeline (python -m src.preprocessing.pipeline) first."
        )

    df = pd.read_csv(source_path)
    logger.info(f"Loaded {len(df)} rows from {source_path}")

    if "Normalized Role" not in df.columns:
        raise ValueError("Expected column 'Normalized Role' not found in processed dataset.")

    mapper = DomainMapper(mapping_path=mapping_path)
    df = mapper.transform_dataframe(df)

    # The domain classifier trains on a plain-text "Skills" feature column;
    # reuse the already-engineered "Skills Text" column for this.
    if "Skills Text" in df.columns:
        df["Skills"] = df["Skills Text"]
    elif "Skills" not in df.columns:
        raise ValueError("Neither 'Skills Text' nor 'Skills' column found in processed dataset.")

    domain_counts = df["Domain"].value_counts()
    logger.info(f"Domain distribution:\n{domain_counts}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)

    logger.info(f"Saved domain training dataset: {output_path} ({len(df)} rows)")

    return df


if __name__ == "__main__":
    build()
