import json
import pandas as pd


class DomainMapper:

    def __init__(self, mapping_path="src/preprocessing/domain_mapping.json"):

        with open(mapping_path, "r") as f:
            self.mapping = json.load(f)

    def map_role(self, role):

        role = str(role).lower()

        for domain, keywords in self.mapping.items():

            for keyword in keywords:

                if keyword in role:
                    return domain

        return "Others"

    def transform_dataframe(self, dataframe):

        dataframe["Domain"] = dataframe["Normalized Role"].apply(
            self.map_role
        )

        return dataframe