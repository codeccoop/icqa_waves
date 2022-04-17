# SYS
import os
import re

# VENDOR
import json
from pymongo import MongoClient

mongodb_uri = "mongodb://127.0.0.1:27017"
client = MongoClient(mongodb_uri)
db = client.icqa_waves


def run():
    countours_dir = "data/contours"
    for magnitude in os.listdir(countours_dir):
        for file_name in os.listdir(os.path.join(countours_dir, magnitude)):
            matches = re.search(
                r"contours\_([0-9]{4})\-([0-9]{1,2})\-([0-9]{1,2})\_([^\.]*)",
                file_name)
            try:
                data = json.load(
                    open(os.path.join(countours_dir, magnitude, file_name)))
                db.contours.insert_one({
                    "mesure": str(magnitude),
                    "region": "8",
                    "year": matches.group(1),
                    "month": matches.group(2),
                    "day": matches.group(3),
                    "hour": matches.group(4),
                    "collection": data
                })
            except Exception as e:
                print(e)


if __name__ == "__main__":
    run()
