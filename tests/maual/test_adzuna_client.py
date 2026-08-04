from pprint import pprint

from src.ingestion.adzuna_client import AdzunaClient


def main():

    client = AdzunaClient()

    result = client.search(
        "Python Internship"
    )

    print()

    print("=" * 60)

    print("Total Results")

    print(result["count"])

    print("=" * 60)

    print()

    pprint(result["results"][0])


if __name__ == "__main__":
    main()