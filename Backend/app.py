from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import os
from bson.objectid import ObjectId

app = Flask(__name__)
CORS(app)

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://Admin:321321@insectidentificationdb.dsfkh.mongodb.net/?retryWrites=true&w=majority&appName=InsectIdentificationDB",
)
client = MongoClient(MONGO_URI)
db = client["insect_identification"]

collection = db["species"]
speciesdata = db["basespeciesdata"]
existingspecies = db["existingspecies"]
alldata = db["species"]
speciesinfo = db["speciesinfo"]
archivespecies = db["archivedspecies"]

@app.route("/api/species", methods=["GET"])
def get_species():
    try:
        data = collection.find_one({}, {"_id": 0}, sort=[("_id", -1)])
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/location", methods=["GET"])
def get_location():
    try:
        data = collection.find({}, {"_id": 0, "latitude": 1, "longitude": 1})
        return jsonify(list(data)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from bson import ObjectId

@app.route("/api/alldata", methods=["GET"])
def get_alldata():
    try:
        data = list(collection.find({}).sort("_id", -1))
        
        # Convert ObjectId to string
        for item in data:
            item["_id"] = str(item["_id"])

        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/speciesinfo", methods=["GET"])
def get_speciesinfo():
    try:
        data = list(speciesinfo.find({}, {"_id": 0})) 
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/archivespecies", methods=["GET"])
def get_archivespecies():
    try:
        data = list(archivespecies.find({}, {"_id": 0}).sort("_id", -1)) 
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/archivespecies", methods=["POST"])
def archive_species():
    try:
        data = request.get_json() 
        if not data:
            return jsonify({"error": "No data provided"}), 400

        result = archivespecies.insert_one(data)
        return jsonify({"message": "Species archived successfully", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/delspecies", methods=["DELETE"])
def remove_species():
    try:
        data = request.get_json()
        if not data or "id" not in data:
            return jsonify({"error": "ID is required to remove a species"}), 400

        species_id = data["id"]

        species = collection.find_one({"_id": ObjectId(species_id)})
        if not species:
            return jsonify({"error": "Species not found"}), 404

        result = collection.delete_one({"_id": ObjectId(species_id)})

        if result.deleted_count == 1:
            return jsonify({"message": "Species removed successfully", "id": species_id}), 200
        else:
            return jsonify({"error": "Backend cannot remove the species "}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/speciesdata", methods=["GET"])
def get_speciesdata():
    try:
        data = list(speciesdata.find({}, {"_id": 0})) 
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/existingspecies", methods=["GET"])
def get_existingspeciesdata():
    try:
        data = list(existingspecies.find({}, {"_id": 0})) 
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/data", methods=["GET"])
def get_data():
    try:
        source = request.args.get("source", "species")
        if source == "species":
            data = collection.find_one({}, {"_id": 0}, sort=[("_id", -1)])
        elif source == "speciesdata":
            data = list(speciesdata.find({}, {"_id": 0}))
        elif source == "existingspecies":
            data = list(existingspecies.find({}, {"_id": 0}))
        elif source == "speciesinfo":
            data = list(speciesinfo.find({}, {"_id": 0}))
        elif source == "archivespecies":
            data = list(archivespecies.find({}, {"_id": 0}))
        else:
            return jsonify({"error": "Invalid source parameter"}), 400
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/", methods=["GET"])
def home():
    return "Welcome to the Insect Identification API", 200

if __name__ == "__main__":
    app.run(debug=True)
