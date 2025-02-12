import os
import json
import base64
import random
from datetime import datetime
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from config import DB_URI, DB_NAME, DB_COLLECTION, OFFLINE_DATA_FILE, MIN_CONFIDENCE, SPECIES_MAPPING


def internet_on(timeout=3):
    """
    Check if the internet is available by attempting to connect to Google's DNS.

    Returns:
        bool: True if internet is available, else False.
    """
    import socket
    try:
        socket.create_connection(("8.8.8.8", 53), timeout=timeout)
        return True
    except OSError:
        return False


def get_db_collection():
    """
    Establish a connection to the MongoDB collection.

    Returns:
        pymongo.collection.Collection: The MongoDB collection handle.
    """
    client = MongoClient(DB_URI, server_api=ServerApi('1'))
    db = client[DB_NAME]
    return db[DB_COLLECTION]


def upload_offline_data():
    """
    Upload offline data from the local OFFLINE_DATA_FILE to MongoDB.
    If upload is successful, the local file is removed.
    """
    if not internet_on():
        return

    if not os.path.exists(OFFLINE_DATA_FILE):
        return

    print("Internet available. Uploading offline data to MongoDB...")
    try:
        collection = get_db_collection()
        with open(OFFLINE_DATA_FILE, "r") as file:
            try:
                offline_data = json.load(file)
                if not isinstance(offline_data, list):
                    offline_data = [offline_data]
            except json.JSONDecodeError:
                offline_data = []

        for record in offline_data:
            try:
                print(f"Uploading {record.get('name', 'Unknown')}...")
                # Read and encode the image in base64
                with open(record["image"], "rb") as img_file:
                    record["image"] = base64.b64encode(img_file.read()).decode("utf-8")
                collection.insert_one(record)
                print(f"Uploaded offline record: {record.get('name', 'Unknown')}")
            except FileNotFoundError:
                print(f"Error: File not found at {record.get('image')}. Skipping.")
            except Exception as e:
                print(f"Error uploading record: {e}")

        os.remove(OFFLINE_DATA_FILE)
        print("Offline data successfully uploaded and cleared.")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")


def save_to_db(species_name, image_path, confidence):
    """
    Save detected species information to MongoDB or locally if internet is unavailable.

    Args:
        species_name (str): Detected species name.
        image_path (str): Path to the image file.
        confidence (float): Detection confidence as a fraction (e.g., 0.95).
    """
    # Convert confidence to percentage
    confidence_percentage = round(confidence * 100, 2)
    if confidence_percentage < MIN_CONFIDENCE:
        print(f"Detection skipped: {species_name} ({confidence_percentage}%) below threshold ({MIN_CONFIDENCE}%)")
        return

    scientific_name = SPECIES_MAPPING.get(species_name.lower(), "Unknown")
    now = datetime.now()
    current_date = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M:%S")

    latitude = round(random.uniform(-90.0, 90.0), 6)
    longitude = round(random.uniform(-180.0, 180.0), 6)

    data = {
        "name": species_name,
        "scientific_name": scientific_name,
        "temperature": "Unknown temperature",
        "light": "Unknown light",
        "heat": "Unknown heat",
        "image": image_path,  # Will be replaced by base64 encoded data if uploading online
        "latitude": latitude,
        "longitude": longitude,
        "confidence": confidence_percentage,
        "date": current_date,
        "time": current_time,
    }

    if not internet_on():
        print("No internet. Saving data locally.")
        # Save data to offline file
        if os.path.exists(OFFLINE_DATA_FILE):
            with open(OFFLINE_DATA_FILE, "r") as file:
                try:
                    existing_data = json.load(file)
                    if not isinstance(existing_data, list):
                        existing_data = [existing_data]
                except json.JSONDecodeError:
                    existing_data = []
        else:
            existing_data = []
        existing_data.append(data)
        with open(OFFLINE_DATA_FILE, "w") as file:
            json.dump(existing_data, file, indent=4)
        print(f"Data saved locally: {species_name} ({scientific_name})")
    else:
        # Upload any offline data first
        upload_offline_data()
        try:
            collection = get_db_collection()
            print(f"Uploading {species_name}...")
            with open(image_path, "rb") as img_file:
                data["image"] = base64.b64encode(img_file.read()).decode("utf-8")
            collection.insert_one(data)
            print(f"Uploaded new entry: {species_name} ({scientific_name})")
        except Exception as e:
            print(f"Error uploading to MongoDB: {e}")
            # If upload fails, save data offline
            if os.path.exists(OFFLINE_DATA_FILE):
                with open(OFFLINE_DATA_FILE, "r") as file:
                    try:
                        existing_data = json.load(file)
                        if not isinstance(existing_data, list):
                            existing_data = [existing_data]
                    except json.JSONDecodeError:
                        existing_data = []
            else:
                existing_data = []
            existing_data.append(data)
            with open(OFFLINE_DATA_FILE, "w") as file:
                json.dump(existing_data, file, indent=4)
            print(f"Data saved locally due to upload failure: {species_name} ({scientific_name})")
