from src.models.embedding_model import EmbeddingModel


def main():
    model = EmbeddingModel()

    print("Loading model...")

    dimension = model.embedding_dimension()

    print(f"Embedding Dimension : {dimension}")


if __name__ == "__main__":
    main()
    