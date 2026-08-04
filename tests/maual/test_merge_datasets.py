import pandas as pd

from src.ingestion.merge_datasets import DatasetMerger


def main():

    DatasetMerger().merge()

    df = pd.read_csv(
        "data/final/training_dataset.csv"
    )

    print(df.head())

    print()

    print(df.shape)


if __name__ == "__main__":

    main()