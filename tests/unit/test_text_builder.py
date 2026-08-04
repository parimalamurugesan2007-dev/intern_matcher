from src.models.text_builder import InternshipTextBuilder
import pandas as pd

df = pd.read_csv("data/processed/internships_processed.csv")

builder = InternshipTextBuilder(df)

result = builder.build_text()

print(result["Internship Text"].iloc[0])