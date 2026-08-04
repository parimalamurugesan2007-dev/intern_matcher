import json
import re


class SkillExtractor:

    def __init__(self):

        with open(
            "data/knowledge/skills.json","r"
        ) as f:

            self.skills = json.load(f)

    def preprocess(self, text):

        text = text.lower()

        text = (
            text.replace(".", " ")
                .replace("-", " ")
                .replace("/", " ")
                .replace("_", " ")
        )

        text = re.sub(r"[^a-z0-9+# ]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()

        return text

    def extract(self, text):

        text = self.preprocess(text)

        found = set()

        for key, canonical in self.skills.items():

            normalized_key = self.preprocess(key)

            if re.search(
                rf"\b{re.escape(normalized_key)}\b",
                text
            ):
                found.add(canonical)

        return sorted(found)