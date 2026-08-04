"""
NER Extractor

Uses HuggingFace Transformer model
to extract entities from resumes.
"""

from transformers import pipeline


class NERExtractor:

    def __init__(self):

        self.ner = pipeline(

            "ner",

            model="dslim/bert-base-NER",

            aggregation_strategy="simple"

        )

    def extract(self, text):

        entities = self.ner(text)

        return entities