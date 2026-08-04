import pandas as pd

df = pd.read_json(

    "logs/predictions.json",

    lines=True

)

print(df.describe())