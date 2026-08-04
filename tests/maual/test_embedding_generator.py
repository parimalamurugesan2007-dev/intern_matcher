from src.models.embedding_generator import EmbeddingGenerator


def main():
    generator = EmbeddingGenerator()
    embeddings = generator.generate()
    print(embeddings.shape)


if __name__ == "__main__":
    main()