import json
from datetime import datetime
from pathlib import Path


class PredictionMonitor:

    def __init__(self):

        self.log_file = Path("logs/predictions.json")

        self.log_file.parent.mkdir(
            exist_ok=True
        )

    def log_prediction(

        self,

        predicted_domain,

        recommendation_count,

        latency

    ):

        record = {

            "timestamp": str(datetime.now()),

            "predicted_domain": predicted_domain,

            "recommendations": recommendation_count,

            "latency": latency

        }

        with open(

            self.log_file,

            "a"

        ) as f:

            f.write(json.dumps(record) + "\n")