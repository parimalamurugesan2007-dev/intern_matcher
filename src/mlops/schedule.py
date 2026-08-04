import schedule
import time

from src.mlops.retrain import trainer

schedule.every().week.do(trainer.run)

while True:

    schedule.run_pending()

    time.sleep(60)