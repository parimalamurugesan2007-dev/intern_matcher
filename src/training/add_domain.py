import pandas as pd

from src.preprocessing.domain_mapper import DomainMapper


INPUT = "data/final/training_dataset.csv"
OUTPUT = "data/final/training_dataset_domain.csv"


def main():

    print("=" * 60)
    print("Loading Training Dataset")
    print("=" * 60)

    df = pd.read_csv(INPUT)

    print("Rows :", len(df))

    mapper = DomainMapper()

    df = mapper.transform_dataframe(df)

    print()
    print(df["Domain"].value_counts())

    df.to_csv(
        OUTPUT,
        index=False
    )

    print()
    print("Saved :", OUTPUT)


if __name__ == "__main__":
    main()