from src.knowledge.skill_dictionary import SkillDictionary

builder = SkillDictionary(
    "data/processed/internships_processed.csv"
)

dictionary = builder.build()

print("Total Skills :", len(dictionary["skills"]))
print("Total Aliases :", len(dictionary["aliases"]))

print()

for i, skill in enumerate(sorted(dictionary["skills"].values())[:30]):
    print(skill)