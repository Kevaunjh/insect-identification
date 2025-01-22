# Design and Development of Invasive Species Identification

This repository provides the front and backend for a web application an invasive species identification software using YOLOv5, that provides users with the functionality of uploading and detecting images, then soting the results in a MongoDB database. 

---

## Features
- **Upload Images**: Users can upload images through a user-friendly interface.
- **Object Detection**: Detect plant or insect species in the uploaded images using the YOLOv5 model.
- **Store Results**: Automatically save detected images and associated data (e.g., species name, habitat, temperature) in a MongoDB database.

---

## Prerequisites
Ensure you have the following installed:

- Python 3.8 or higher
- pip (Python package manager)
- MongoDB Atlas account or a local MongoDB server
- YOLOv5 pre-trained model files

---

## Installation

1. **Clone the Repository**  
   ```bash
   git clone https://https://github.com/Kevaunjh/insect-identification.git
   cd insect-identification
   ```

2. **Install Required Python Libraries**  
   Install dependencies using `pip`:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set Up MongoDB**  
   - Use a MongoDB Atlas cluster or a local MongoDB instance.
   - Update the connection URI in the Python code to match your MongoDB setup:
     ```python
     uri = "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority"
     ```

4. **Download YOLOv5 Weights**<br>
   *In this repository we already provide the latest trained weights we've used.*<br>
   Download the pre-trained YOLOv5 weights (e.g., `yolov5s.pt`) and place them in the project directory:
   ```bash
   wget https://github.com/ultralytics/yolov5/releases/download/v7.0/yolov5s.pt
   ```

