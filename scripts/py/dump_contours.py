# SYS
from os import listdir
from os.path import join
import re

# VENDOR
import simplejson as json
from pymongo import MongoClient


mongodb_uri = "mongodb://127.0.0.1:27017"
client = MongoClient(mongodb_uri)
db = client.icqa_waves

def run ():
    directory = "./data/contours/10/8"
    i = 1
    l = len(listdir(directory))
    for file in listdir(directory):
        matches = re.search(r"contours\_([0-9]{4})\-([0-9]{1,2})\-([0-9]{1,2})\_([^\.]*)", file)
        try:
            data = json.load(open(join(directory, file)))
            # db.contours.insert_many([
            #     {
            #         "mesure": "10",
            #         "region": "8",
            #         "year": matches.group(1),
            #         "month": matches.group(2),
            #         "day": matches.group(3),
            #         "hour": matches.group(4),
            #         "feature": feat
            #     } for feat in data.get("features", [])
            # ])
            db.contours.insert_one({
                "mesure": "10",
                "region": "8",
                "year": matches.group(1),
                "month": matches.group(2),
                "day": matches.group(3),
                "hour": matches.group(4),
                "collection": data
            })
            print(str(int(i/l*100)) + ' %  - ', file)
            i += 1
        except Exception as e:
            print(e)
        

if __name__ == "__main__":
    run()