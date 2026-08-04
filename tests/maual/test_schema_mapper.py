import pandas as pd

from src.ingestion.schema_mapper import SchemaMapper


def main():

    SchemaMapper().run()

    df = pd.read_csv(
        "data/processed/adzuna_processed.csv"
    )

    print(df.head())

    print()

    print(df.columns)

    print()

    print("Rows :", len(df))


if __name__ == "__main__":
    main()