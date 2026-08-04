from pathlib import Path
import pandas as pd
import json
import ast


class SkillDictionaryBuilder:

    def __init__(
        self,
        internship_dataset,
        resume_dataset=None
    ):

        self.internship_dataset = internship_dataset
        self.resume_dataset = resume_dataset

    # --------------------------------------------------

    def internship_skills(self):

        df = pd.read_csv(self.internship_dataset)

        skills = set()

        for value in df["Normalized Skills"]:

            if pd.isna(value):
                continue

            try:

                items = ast.literal_eval(value)

                for skill in items:

                    skills.add(skill.strip())

            except Exception:
                pass

        return skills

    # --------------------------------------------------

    def resume_skills(self):

        if self.resume_dataset is None:
            return set()

        df = pd.read_csv(self.resume_dataset)

        skills = set()

        for value in df["Skills"]:

            if pd.isna(value):
                continue

            for skill in value.split(","):

                skills.add(skill.strip())

        return skills

    # --------------------------------------------------

    def normalize(self, skills):

        normalized = {}

        for skill in skills:

            key = skill.lower().strip()

            normalized[key] = skill

        return normalized

    # --------------------------------------------------

    def save(self):

        skills = (
            self.internship_skills()
            |
            self.resume_skills()
        )

        dictionary = self.normalize(skills)

        Path("data/knowledge").mkdir(
            exist_ok=True
        )

        with open(
            "data/knowledge/skills.json",
            "w"
        ) as f:

            json.dump(
                dictionary,
                f,
                indent=4
            )

        print("Dictionary Created")
        print("Skills :", len(dictionary))
if __name__ == "__main__":

    builder = SkillDictionaryBuilder(
    internship_dataset="data/final/training_dataset_domain.csv",
            resume_dataset=None      # or your resume dataset path if you have one
        )

    builder.save()