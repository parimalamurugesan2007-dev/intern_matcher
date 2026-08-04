"""
Pipeline Entry Point
"""

from pprint import pprint

from src.preprocessing.data_cleaner import DataCleaner
from src.preprocessing.dataset_loader import DatasetLoader
from src.preprocessing.dataset_transformer import DatasetTransformer
from src.preprocessing.dataset_validator import DatasetValidator
from src.preprocessing.role_normalizer import RoleNormalizer
from src.preprocessing.skill_normalizer import SkillNormalizer
from src.preprocessing.feature_engineering import FeatureEngineering
from src.preprocessing.dataset_exporter import DatasetExporter
DATASET_PATH = "data/raw/internships.csv"


def main():

    loader = DatasetLoader(DATASET_PATH)

    dataframe = loader.load()

    validator = DatasetValidator(dataframe)

    report = validator.run()

    print("\n")
    print("=" * 60)
    print("VALIDATION REPORT")
    print("=" * 60)
    pprint(report)

    transformer = DatasetTransformer(dataframe)

    transformed = transformer.transform()

    cleaner = DataCleaner(transformed)

    cleaned = cleaner.clean()

    normalizer = RoleNormalizer(cleaned)

    normalized = normalizer.normalize()
    skill_normalizer = SkillNormalizer(normalized)

    normalized = skill_normalizer.normalize()
    feature_engineer = FeatureEngineering(normalized)

    engineered = feature_engineer.engineer()
    exporter = DatasetExporter(engineered)

    output_path = exporter.export()
    print("\n")
    print("=" * 90)
    print("PIPELINE COMPLETED SUCCESSFULLY")
    print("=" * 90)

    print(f"Processed Dataset : {output_path}")
    print(f"Rows              : {len(engineered)}")
    print(f"Columns           : {len(engineered.columns)}")

    print("=" * 90)

if __name__ == "__main__":
    main()