# Ultralytics 🚀 AGPL-3.0 License - https://ultralytics.com/license
"""
Run YOLOv5 detection inference on images, videos, directories, globs, YouTube, webcam, streams, etc.
"""

import argparse
import csv
import datetime
import os
import platform
import sys
import threading
import time
import traceback
from pathlib import Path

# Scientific and data processing libraries
import base64
import json
import random

# Machine learning and computer vision
import torch
import cv2

# MongoDB and Serial Communication
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from serial_port_manager import SerialPortManager

# Rover Control
from Rosmaster_Lib import Rosmaster

# Configuration
from config import (
    ROOT, 
    MIN_CONFIDENCE, 
    SPECIES_MAPPING, 
    DB_URI, 
    DB_NAME, 
    DB_COLLECTION, 
    OFFLINE_DATA_FILE
)

# Ultralytics YOLOv5 imports
from models.common import DetectMultiBackend
from utils.dataloaders import IMG_FORMATS, VID_FORMATS, LoadImages, LoadScreenshots, LoadStreams
from utils.general import (
    LOGGER,
    Profile,
    check_file,
    check_img_size,
    check_imshow,
    colorstr,
    increment_path,
    non_max_suppression,
    print_args,
    scale_boxes,
    strip_optimizer,
    xyxy2xywh,
)
from utils.plots import Annotator, colors, save_one_box
from utils.torch_utils import select_device, smart_inference_mode

# Global Variables
PauseVariable = 0
distance = 0
start = 0
justConnected = False

# Rover Initialization
rover = Rosmaster()

# Serial Port Manager
port_manager = SerialPortManager()

def check_requirements(requirements_path=None, exclude=None):
    """
    Check and install requirements.
    
    Args:
        requirements_path (Path, optional): Path to requirements file
        exclude (tuple, optional): Packages to exclude from checking
    """
    # Potential paths for requirements file
    potential_paths = [
        Path.cwd() / 'requirements.txt',
        Path(__file__).parent / 'requirements.txt',
        Path(__file__).parent.parent / 'requirements.txt'
    ]
    
    # Find the first existing requirements file
    if requirements_path is None:
        requirements_path = next((path for path in potential_paths if path.exists()), None)
    
    # Print debugging information
    if requirements_path:
        print(f"Checking requirements at: {requirements_path}")
        # Add any specific requirement checking logic here if needed
    else:
        print("No requirements.txt file found.")
        print("Potential paths checked:")
        for path in potential_paths:
            print(f"  - {path}")

def stop_moving():
    """Stop rover motion."""
    try:
        rover.set_car_motion(0.0, 0, 0)
    except Exception as e:
        print(f"Error stopping rover: {e}")

def reset_arm_position():
    """Reset rover arm to default position."""
    try:
        rover.set_uart_servo_angle(6, 90, 5000)
        time.sleep(0.05)
        rover.set_uart_servo_angle(5, 90, 5000)
        time.sleep(0.05)
        rover.set_uart_servo_angle(4, 0, 5000)
        time.sleep(0.05)
        rover.set_uart_servo_angle(3, 20, 5000)
        time.sleep(0.05)
        rover.set_uart_servo_angle(2, 90, 5000)
        time.sleep(0.05)
        rover.set_uart_servo_angle(1, 90, 5000)
        time.sleep(0.05)
    except Exception as e:
        print(f"Error resetting arm position: {e}")

def safe_serial_read():
    """
    Safely read serial data using the SerialPortManager.
    
    Returns:
        dict: Parsed serial data or None if reading fails
    """
    def serial_operation(ser):
        from serial_port_manager import read_serial_data
        return read_serial_data(ser)
    
    try:
        return port_manager.manage_port_access(serial_operation)
    except Exception as e:
        print(f"Error in safe serial read: {e}")
        traceback.print_exc()
        return None

def internet_on():
    """Check if the internet is available."""
    try:
        import socket
        socket.create_connection(("8.8.8.8", 53), timeout=3)
        return True
    except OSError:
        return False

def startup():
    """Check internet connection and upload any offline data to MongoDB."""
    if internet_on():
        print("Internet available. Uploading data to MongoDB...")
        
        try:
            client = MongoClient(DB_URI, server_api=ServerApi('1'))
            client.admin.command('ping')
            print("Connected to MongoDB!")

            db = client[DB_NAME]
            collection = db[DB_COLLECTION]

            if os.path.exists(OFFLINE_DATA_FILE):
                with open(OFFLINE_DATA_FILE, "r") as file:
                    try:
                        offline_data = json.load(file)
                        offline_data = offline_data if isinstance(offline_data, list) else [offline_data]
                    except json.JSONDecodeError:
                        offline_data = []

                for record in offline_data:
                    try:
                        print(f"Uploading {record['name']}...")
                        with open(record["image"], "rb") as img_file:
                            record["image"] = base64.b64encode(img_file.read()).decode("utf-8")

                        collection.insert_one(record)
                        print(f"Uploaded offline record: {record['name']} ({record['scientific_name']})")

                    except FileNotFoundError:
                        print(f"Error: File not found at {record.get('image', 'Unknown path')}. Skipping.")
                    except Exception as e:
                        print(f"Error uploading offline record: {e}")

                # Remove the file after successful upload
                os.remove(OFFLINE_DATA_FILE)
                print("Offline data successfully uploaded and cleared.")
                       
        except Exception as e:
            print(f"Error saving to MongoDB: {e}")

def move_towards():
    """Move rover towards detected object."""
    global distance
    movingdistance = distance * 2
    print("Moving forwards")
    rover.set_car_motion(0.2, 0, 0)
    time.sleep(movingdistance)
    rover.set_car_motion(0.0, 0, 0)
    print("Stopping")

def move_away():
    """Move rover away from detected object."""
    global distance
    movingdistance = distance * 2
    print("Moving Backwards")
    rover.set_car_motion(-0.2, 0, 0)
    time.sleep(movingdistance)
    rover.set_car_motion(0.0, 0, 0)
    print("Stopping")

def arm_point():
    """Position rover arm to point."""
    rover.set_uart_servo_angle(6, 90, 5000)
    time.sleep(0.05)
    rover.set_uart_servo_angle(5, 90, 5000)
    time.sleep(0.05)
    rover.set_uart_servo_angle(4, 67, 5000)
    time.sleep(0.05)
    rover.set_uart_servo_angle(3, 80, 5000)
    time.sleep(0.05)
    rover.set_uart_servo_angle(2, 40, 5000)
    time.sleep(0.05)
    rover.set_uart_servo_angle(1, 90, 5000)
    time.sleep(5)

def arm_follow_tape():
    """Reset arm to follow tape."""
    global PauseVariable
    rover.set_uart_servo_angle(6, 90, 5000)
    time.sleep(0.05)
    rover.set_uart_servo_angle(5, 90, 5000)
    time.sleep(0.05)
    rover.set_uart_servo_angle(4, 0, 5000)
    time.sleep(0.05)
    rover.set_uart_servo_angle(3, 20, 5000)
    time.sleep(0.05)
    rover.set_uart_servo_angle(2, 90, 5000)
    time.sleep(0.05)
    rover.set_uart_servo_angle(1, 90, 5000)
    time.sleep(0.05)
    
    PauseVariable = 0
    print("FINISHED", flush=True)

def run_led_daemon(species_name):
    """Run LED indicator in a separate thread."""
    led_thread = threading.Thread(target=display_led, args=(species_name,), daemon=True)
    led_thread.start()

def display_led(species_name):
    """
    Display LED indicators based on species risk level.
    
    Args:
        species_name (str): Name of the detected species
    """
    species_risk = {
        "Box Tree Moth": 2,
        "Northern Hornet": 1,
        "Spotted Lanternfly": 2,
        "Japanese Beetle": 2,
        "Stink Bugs": 1,
        "Ant": 0,
        "Bumble Bee": 0,
        "Ladybug": 0,
        "Monarch Butterfly": 0,
        "Wolf Spider": 0,
        "Creeping Thistle": 2,
        "Himalayan Balsam": 2,
        "Japanese Knotweed": 2,
        "Leafy Spurge": 2,
        "Purple Loosestrife": 2,
        "Common Lilac": 0
    }

    risk_level = species_risk.get(species_name, 0)
    rover.set_car_motion(0,0,0)
    
    # LED and Beep Logic based on risk level
    if risk_level == 2:
        for x in range(0,15,1):
            rover.set_colorful_lamps(x, 255, 0, 0)
            time.sleep(0.05)
        for x in range(0,3,1):
                rover.set_beep(1)
                time.sleep(0.5)
                rover.set_beep(0)
    elif risk_level == 1:
        for x in range(0,15,1):
            rover.set_colorful_lamps(x, 255, 255, 0)
            time.sleep(0.05)
        for x in range(0,2,1):
            rover.set_beep(1)
            time.sleep(0.5)
            rover.set_beep(0)
    else:
        for x in range(0,15,1):
            rover.set_colorful_lamps(x, 0, 255, 0)
            time.sleep(0.05)
        rover.set_beep(1)
        time.sleep(0.5)
        rover.set_beep(0)

    # Reset LED
    time.sleep(0.05)
    for x in range(0,15,1):
        rover.set_colorful_lamps(x, 0, 0, 0)
        time.sleep(0.05)
    
    time.sleep(1)
    move_towards()
    time.sleep(2)
    arm_point()
    time.sleep(2)
    move_away()
    time.sleep(2)
    arm_follow_tape()
    time.sleep(10)
    
    sys.exit(0)

def save_to_db(species_name, image_path, confidence):
    """
    Save detected species information to MongoDB or local JSON.
    
    Args:
        species_name (str): Name of the detected species
        image_path (str): Path to the image
        confidence (float): Detection confidence
    """
    global justConnected, PauseVariable, distance

    # Confidence validation
    confidence = round(confidence * 100, 2)
    if confidence < MIN_CONFIDENCE:
        print(f"Detection skipped: {species_name} ({confidence}%) below confidence threshold ({MIN_CONFIDENCE}%)")
        return

    # Skip specific species if needed
    if species_name.lower() == "spotted lanternfly":
        return

    print("LOCATED", flush=True)

    # Get scientific name
    scientific_name = SPECIES_MAPPING.get(species_name.lower(), "Unknown species")
    
    # Current timestamp
    now = datetime.datetime.now()
    current_date = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M:%S")

    # Initialize sensor data
    sensor_data = {
        'longitude': 0,
        'latitude': 0,
        'temperature': 0,
        'light': 0
    }

    # Safely read serial data
    serial_reading = safe_serial_read()
    if serial_reading:
        sensor_data.update(serial_reading)
        print(f"Sensor Data: {sensor_data}")

    # Prepare data for storage
    data = {
        "name": species_name,
        "scientific_name": scientific_name,
        "temperature": sensor_data['temperature'],
        "light": sensor_data['light'],
        "image": image_path, 
        "latitude": sensor_data['latitude'],
        "longitude": sensor_data['longitude'],
        "confidence": confidence,
        "date": current_date,
        "time": current_time,
    }

    # Pause and prepare for LED/movement sequence
    PauseVariable = 1
    rover.set_car_motion(0,0,0)
    run_led_daemon(species_name)

    # Wait for LED sequence to complete
    while PauseVariable == 1:
        time.sleep(1)

    # Offline/Online data handling
    if not internet_on():
        print("No internet. Saving data locally.")
        
        # Read existing local data
        existing_data = []
        if os.path.exists(OFFLINE_DATA_FILE):
            try:
                with open(OFFLINE_DATA_FILE, "r") as file:
                    existing_data = json.load(file)
                    existing_data = existing_data if isinstance(existing_data, list) else [existing_data]
            except json.JSONDecodeError:
                existing_data = []

        # Add new data and save
        existing_data.append(data)
        with open(OFFLINE_DATA_FILE, "w") as file:
            json.dump(existing_data, file, indent=4)

        print(f"Data saved locally: {species_name} ({scientific_name})")
        
    else:
        # Online data handling
        try:
            client = MongoClient(DB_URI, server_api=ServerApi('1'))
            db = client[DB_NAME]
            collection = db[DB_COLLECTION]

            print(f"Uploading {species_name}...")
            with open(image_path, "rb") as img_file:
                data["image"] = base64.b64encode(img_file.read()).decode("utf-8")
                collection.insert_one(data)
                print(f"Uploaded new entry: {species_name} ({scientific_name})")
        
        except Exception as e:
            print(f"Error uploading to MongoDB: {e}")
            # Fallback to local storage if MongoDB upload fails
            existing_data = []
            if os.path.exists(OFFLINE_DATA_FILE):
                try:
                    with open(OFFLINE_DATA_FILE, "r") as file:
                        existing_data = json.load(file)
                        existing_data = existing_data if isinstance(existing_data, list) else [existing_data]
                except json.JSONDecodeError:
                    existing_data = []

            existing_data.append(data)
            with open(OFFLINE_DATA_FILE, "w") as file:
                json.dump(existing_data, file, indent=4)
            print(f"Saved data locally due to MongoDB error: {species_name} ({scientific_name})")

    # Reset global variables
    global start
    start = 0

def check_wifi_thread():
    """Background thread to check wifi connection."""
    while True:
        if not internet_on():
            print("No internet connection. Running startup check...")
            startup()
        time.sleep(50)

@smart_inference_mode()
def run(
    weights=ROOT / "yolov5s.pt",  # model path or triton URL
    source=ROOT / "data/images",  # file/dir/URL/glob/screen/0(webcam)
    data=ROOT / "data/coco128.yaml",  # dataset.yaml path
    imgsz=(640, 640),  # inference size (height, width)
    conf_thres=0.25,  # confidence threshold
    iou_thres=0.45,  # NMS IOU threshold
    max_det=1000,  # maximum detections per image
    device="",  # cuda device, i.e. 0 or 0,1,2,3 or cpu
    view_img=False,  # show results
    save_txt=False,  # save results to *.txt
    save_format=0,  # save boxes coordinates in YOLO format or Pascal-VOC format
    save_csv=False,  # save results in CSV format
    save_conf=False,  # save confidences in --save-txt labels
    save_crop=False,  # save cropped prediction boxes
    nosave=False,  # do not save images/videos
    classes=None,  # filter by class: --class 0, or --class 0 2 3
    agnostic_nms=False,  # class-agnostic NMS
    augment=False,  # augmented inference
    visualize=False,  # visualize features
    update=False,  # update all models
    project=ROOT / "runs/detect",  # save results to project/name
    name="exp",  # save results to project/name
    exist_ok=False,  # existing project/name ok, do not increment
    line_thickness=3,  # bounding box thickness (pixels)
    hide_labels=False,  # hide labels
    hide_conf=False,  # hide confidences
    half=False,  # use FP16 half-precision inference
    dnn=False,  # use OpenCV DNN for ONNX inference
    vid_stride=1,  # video frame-rate stride
):
    """
    Run YOLOv5 detection inference on various sources.
    
    Args:
        (multiple arguments as defined in the function signature)
    
    Returns:
        None
    """
    # Print debugging information
    print("Weights path:", weights)
    print("Weights file exists:", os.path.exists(weights))
    
    source = str(source)
    save_img = not nosave and not source.endswith(".txt")  # save inference images
    is_file = Path(source).suffix[1:] in (IMG_FORMATS + VID_FORMATS)
    is_url = source.lower().startswith(("rtsp://", "rtmp://", "http://", "https://"))
    webcam = source.startswith("/dev/")
    screenshot = source.lower().startswith("screen")
    if is_url and is_file:
        source = check_file(source)  # download

    # Directories
    save_dir = increment_path(Path(project) / name, exist_ok=exist_ok)  # increment run
    (save_dir / "labels" if save_txt else save_dir).mkdir(parents=True, exist_ok=True)  # make dir

    # Load model
    device = select_device(device)
    model = DetectMultiBackend(weights, device=device, dnn=dnn, data=data, fp16=half)
    stride, names, pt = model.stride, model.names, model.pt
    imgsz = check_img_size(imgsz, s=stride)  # check image size

    # Dataloader
    bs = 1  # batch_size
    if webcam:
        view_img = check_imshow(warn=True)
        dataset = LoadStreams(source, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
        bs = len(dataset)
    elif screenshot:
        dataset = LoadScreenshots(source, img_size=imgsz, stride=stride, auto=pt)
    else:
        dataset = LoadImages(source, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
    vid_path, vid_writer = [None] * bs, [None] * bs

    # Initialize rover and reset arm position
    reset_arm_position()

    # Initialize startup and wifi checking
    startup()

    # Run inference
    model.warmup(imgsz=(1 if pt or model.triton else bs, 3, *imgsz))  # warmup
    seen, windows, dt = 0, [], (Profile(device=device), Profile(device=device), Profile(device=device))
    
    # Detection number for saving images
    detection_number = 1

    global start, PauseVariable
    start = 0
    start_time = time.time()

    for path, im, im0s, vid_cap, s in dataset:
        # Wait if pause is active
        while PauseVariable == 1:
            time.sleep(1)
        
        with dt[0]:
            im = torch.from_numpy(im).to(model.device)
            im = im.half() if model.fp16 else im.float()  # uint8 to fp16/32
            im /= 255  # 0 - 255 to 0.0 - 1.0
            if len(im.shape) == 3:
                im = im[None]  # expand for batch dim
            if model.xml and im.shape[0] > 1:
                ims = torch.chunk(im, im.shape[0], 0)

        # Inference
        with dt[1]:
            visualize = increment_path(save_dir / Path(path).stem, mkdir=True) if visualize else False
            if model.xml and im.shape[0] > 1:
                pred = None
                for image in ims:
                    if pred is None:
                        pred = model(image, augment=augment, visualize=visualize).unsqueeze(0)
                    else:
                        pred = torch.cat((pred, model(image, augment=augment, visualize=visualize).unsqueeze(0)), dim=0)
                pred = [pred, None]
            else:
                pred = model(im, augment=augment, visualize=visualize)

        # NMS
        with dt[2]:
            pred = non_max_suppression(pred, conf_thres, iou_thres, classes, agnostic_nms, max_det=max_det)

        # Process predictions
        for i, det in enumerate(pred):  # per image
            seen += 1
            if webcam:  # batch_size >= 1
                p, im0, frame = path[i], im0s[i].copy(), dataset.count
                s += f"{i}: "
            else:
                p, im0, frame = path, im0s.copy(), getattr(dataset, "frame", 0)

            p = Path(p)  # to Path
            save_path = str(save_dir / p.name)  # im.jpg
            txt_path = str(save_dir / "labels" / p.stem) + ("" if dataset.mode == "image" else f"_{frame}")  # im.txt
            s += "{:g}x{:g} ".format(*im.shape[2:])  # print string
            gn = torch.tensor(im0.shape)[[1, 0, 1, 0]]  # normalization gain whwh
            imc = im0.copy() if save_crop else im0  # for save_crop
            annotator = Annotator(im0, line_width=line_thickness, example=str(names))
            
            if len(det):
                # Rescale boxes from img_size to im0 size
                det[:, :4] = scale_boxes(im.shape[2:], det[:, :4], im0.shape).round()

                # Print results
                for c in det[:, 5].unique():
                    n = (det[:, 5] == c).sum()  # detections per class
                    s += f"{n} {names[int(c)]}{'s' * (n > 1)}, "  # add to string

                # Process each detection
                for *xyxy, conf, cls in reversed(det):
                    c = int(cls)
                    species_name = names[c]

                    # Calculate object distance
                    x_min, y_min, x_max, y_max = xyxy
                    width = x_max - x_min
                    height = y_max - y_min
                    global distance
                    tempdistance = (200 * 0.3) / height
                    distance = tempdistance.item()

                    # Confidence and labeling
                    label = names[c] if hide_conf else f"{names[c]}"
                    confidence = float(conf)
                    confidence_str = f"{confidence:.2f}"

                    # Save results to CSV if enabled
                    if save_csv:
                        csv_path = save_dir / "predictions.csv"
                        file_exists = os.path.isfile(csv_path)
                        with open(csv_path, mode="a", newline="") as f:
                            writer = csv.writer(f)
                            if not file_exists:
                                writer.writerow(["Image Name", "Prediction", "Confidence"])
                            writer.writerow([p.name, label, confidence_str])

                    # Annotate image
                    if save_img or save_crop or view_img:
                        label = None if hide_labels else (names[c] if hide_conf else f"{names[c]} {conf:.2f}")
                        annotator.box_label(xyxy, label, color=colors(c, True))
                    
                    # Save cropped images if enabled
                    if save_crop:
                        save_one_box(xyxy, imc, file=save_dir / "crops" / names[c] / f"{p.stem}.jpg", BGR=True)

            # Stream results
            im0 = annotator.result()
            if view_img:
                if platform.system() == "Linux" and p not in windows:
                    windows.append(p)
                    cv2.namedWindow(str(p), cv2.WINDOW_NORMAL | cv2.WINDOW_KEEPRATIO)
                    cv2.resizeWindow(str(p), im0.shape[1], im0.shape[0])
                cv2.imshow(str(p), im0)
                cv2.waitKey(1)

            # Save detection images
            if save_img and len(det) and confidence >= 0.8:
                if dataset.mode == "stream":
                    if start >= 50:
                        detection_number += 1
                        detection_folder = f"detection_{detection_number}"
                        save_path_dir = Path(save_path).parent / detection_folder
                        os.makedirs(save_path_dir, exist_ok=True)
                        save_path_img = str((save_path_dir / Path(save_path).name).with_suffix(".jpg"))
                        cv2.imwrite(save_path_img, im0)
                        save_to_db(species_name, save_path_img, confidence)
                        print("Time elapsed: ", start)
                else:  # video
                    if vid_path[i] != save_path:
                        vid_path[i] = save_path
                        if isinstance(vid_writer[i], cv2.VideoWriter):
                            vid_writer[i].release()
                        if vid_cap:
                            fps = vid_cap.get(cv2.CAP_PROP_FPS)
                            w = int(vid_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                            h = int(vid_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                        else:
                            fps, w, h = 30, im0.shape[1], im0.shape[0]
                        save_path = str(Path(save_path).with_suffix(".mp4"))
                        vid_writer[i] = cv2.VideoWriter(save_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))
                    vid_writer[i].write(im0)

            start += 1
            print("Timer: ", start)

        # Update log info
        LOGGER.info(f"{s}{'' if len(det) else '(no detections), '}{dt[1].dt * 1e3:.1f}ms")

    # Print final results
    t = tuple(x.t / seen * 1e3 for x in dt)
    LOGGER.info(f"Speed: %.1fms pre-process, %.1fms inference, %.1fms NMS per image at shape {(1, 3, *imgsz)}" % t)
    
    if save_txt or save_img:
        s = f"\n{len(list(save_dir.glob('labels/*.txt')))} labels saved to {save_dir / 'labels'}" if save_txt else ""
        LOGGER.info(f"Results saved to {colorstr('bold', save_dir)}{s}")
    
    if update:
        strip_optimizer(weights[0])

def main(**kwargs):
    """
    Main function to execute YOLOv5 detection with parsed arguments.
    
    Args:
        **kwargs: Keyword arguments from parse_opt()
    """
    # Print debugging information
    print("Main function called with kwargs:")
    for key, value in kwargs.items():
        print(f"{key}: {value}")
    
    # Check and install requirements
    check_requirements(ROOT / "requirements.txt", exclude=("tensorboard", "thop"))
    
    # Run detection
    run(**kwargs)

if __name__ == "__main__":
    try:
        # Print additional debugging information
        print("Current Working Directory:", os.getcwd())
        print("Script Location:", os.path.dirname(os.path.abspath(__file__)))
        print("Python Path:", sys.path)
        
        # Start background wifi checking thread
        wifi_thread = threading.Thread(target=check_wifi_thread, daemon=True)
        wifi_thread.start()
        
        # Parse options 
        from config import parse_opt
        opt = parse_opt()
        
        # Convert Namespace to dictionary and pass to main
        main(**vars(opt))
    
    except Exception as e:
        print(f"Unexpected error in main execution: {e}")
        traceback.print_exc()
    finally:
        # Ensure rover stops and arms are reset
        stop_moving()
        reset_arm_position()