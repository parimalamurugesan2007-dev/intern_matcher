import pandas as pd

from src.preprocessing.domain_mapper import DomainMapper


def main():

    mapper = DomainMapper()

    df = pd.read_csv(
        "data/processed/internships_processed.csv"
    )

    df = mapper.transform_dataframe(df)

    print(df[["Normalized Role", "Domain"]].head(30))

    print()

    print("=" * 60)

    print(df["Domain"].value_counts())


if __name__ == "__main__":
    main()