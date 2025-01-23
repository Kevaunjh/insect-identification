from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import os

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

@app.route("/api/species", methods=["GET"])
def get_species():
    try:
        data = collection.find_one({}, {"_id": 0}, sort=[("_id", -1)])
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/alldata", methods=["GET"])
def get_alldata():
    try:
        data = list(collection.find({}, {"_id": 0}).sort("_id", -1))
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
        elif source == "exisitingspecies":
            data = list(speciesdata.find({}, {"_id": 0}))
        elif source == "speciesinfo":
            data = list(speciesinfo.find({}, {"_id": 0}))
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
