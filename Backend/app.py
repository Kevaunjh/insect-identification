from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for frontend requests

# MongoDB configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://<username>:<password>@cluster.mongodb.net/mydatabase")
client = MongoClient(MONGO_URI)
db = client["insect_identification"]  # Replace with your database name
collection = db["species"]  # Replace with your collection name

@app.route("/api/data", methods=["GET"])
def get_data():
    """Fetch all data from the MongoDB collection."""
    try:
        data = list(collection.find({}, {"_id": 0}))  # Exclude MongoDB's ObjectId field
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/data", methods=["POST"])
def add_data():
    """Insert new data into the MongoDB collection."""
    try:
        new_data = request.json
        collection.insert_one(new_data)
        return jsonify({"message": "Data added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
