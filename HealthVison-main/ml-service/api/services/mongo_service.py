from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

print("Mongo URI:", MONGO_URI)

client = MongoClient(MONGO_URI)

db = client["test"]
collection = db["reports"]

print("Connected DB:", db.name)
print("Collections:", db.list_collection_names())


def get_report_by_id(report_id: str):

    report_id = report_id.strip()

    print("Searching for ID:", report_id)

    try:
        object_id = ObjectId(report_id)
    except Exception as e:
        print("Invalid ObjectId:", e)
        return None

    report = collection.find_one({"_id": object_id})
    print("Testing DB connection...")
    doc = collection.find_one()
    

    return report