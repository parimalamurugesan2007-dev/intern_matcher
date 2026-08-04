from src.knowledge.skill_dictionary import SkillDictionaryBuilder

if __name__ == "__main__":

    SkillDictionaryBuilder(
        internship_dataset="data/final/training_dataset_domain.csv",
        resume_dataset=None
    ).save()