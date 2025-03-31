import os
import sys
import argparse
from pathlib import Path

# Determine the project root directory
FILE = Path(__file__).resolve()
ROOT = FILE.parents[0]  # Yolov5Detect directory
PROJECT_ROOT = ROOT.parent  # insect-identification directory

# Global constants
MIN_CONFIDENCE = 70  # Minimum confidence threshold for detections

# Database configuration
DB_URI = "mongodb+srv://Admin:321321@insectidentificationdb.dsfkh.mongodb.net/?retryWrites=true&w=majority&appName=InsectIdentificationDB"
DB_NAME = "insect_identification"
DB_COLLECTION = "species"

# Offline data storage file
OFFLINE_DATA_FILE = "holding_species.json"

# Species mapping for detected classes
SPECIES_MAPPING = {
    "box tree moth": "Cydalima perspectalis",
    "northern hornet": "Vespa crabro",
    "spotted lanternfly": "Lycorma delicatula",
    "japanese beetle": "Popillia japonica",
    "stink bugs": "Pentatomidae",
    "ant": "Formicidae",
    "bumble bee": "Bombus",
    "ladybug": "Coccinellidae",
    "monarch butterfly": "Danaus plexippus",
    "wolf spider": "Lycosidae",
    "creeping thistle": "Cirsium arvense",
    "himalayan balsam": "Impatiens glandulifera",
    "japanese knotweed": "Reynoutria japonica",
    "leafy spurge": "Euphorbia esula",
    "purple loosestrife": "Lythrum salicaria",
    "common lilac": "Syringa vulgaris",
    "common milkweed": "Asclepias syriaca",
    "common yarrow": "Achillea millefolium",
    "red osier dogwood": "Cornus sericea",
    "staghorn sumac": "Rhus typhina",
}

def parse_opt():
    """
    Parse command-line arguments for YOLOv5 detection inference.

    Returns:
        argparse.Namespace: Parsed command-line options.
    """
    # Potential model paths
    potential_paths = [
        Path(__file__).parent.parent / 'insectmodel/best.pt',
        Path.home() / 'insect-identification/insectmodel/best.pt',
        Path.cwd() / '../insectmodel/best.pt',
        Path.cwd() / 'best.pt'
    ]
    
    # Find the first existing model path
    model_path = next((str(path.resolve()) for path in potential_paths if path.exists()), None)
    
    # Create a default images directory if it doesn't exist
    default_source_dir = Path(__file__).parent / 'data/images'
    default_source_dir.mkdir(parents=True, exist_ok=True)

    parser = argparse.ArgumentParser()
    parser.add_argument("--weights", nargs="+", type=str, 
        default=model_path,
        help="model path or triton URL")
    parser.add_argument("--source", type=str, 
        default=str(default_source_dir), 
        help="file/dir/URL/glob/screen/0(webcam)")
    parser.add_argument("--data", type=str, default=str(ROOT / "data/coco128.yaml"),
        help="dataset.yaml path")
    parser.add_argument("--imgsz", "--img", "--img-size", nargs="+", type=int, default=[640],
        help="inference size h,w")
    parser.add_argument("--conf-thres", type=float, default=0.25, help="confidence threshold")
    parser.add_argument("--iou-thres", type=float, default=0.45, help="NMS IoU threshold")
    parser.add_argument("--max-det", type=int, default=1000, help="maximum detections per image")
    parser.add_argument("--device", default="", help="cuda device, i.e. 0 or 0,1,2,3 or cpu")
    parser.add_argument("--view-img", action="store_true", help="show results")
    parser.add_argument("--save-txt", action="store_true", help="save results to *.txt")
    parser.add_argument("--save-format", type=int, default=0,
        help="save boxes coordinates in YOLO (0) or Pascal-VOC (1) format")
    parser.add_argument("--save-csv", action="store_true", help="save results in CSV format")
    parser.add_argument("--save-conf", action="store_true", help="save confidences in labels")
    parser.add_argument("--save-crop", action="store_true", help="save cropped prediction boxes")
    parser.add_argument("--nosave", action="store_true", help="do not save images/videos")
    parser.add_argument("--classes", nargs="+", type=int, help="filter by class, e.g., --classes 0 or --classes 0 2 3")
    parser.add_argument("--agnostic-nms", action="store_true", help="class-agnostic NMS")
    parser.add_argument("--augment", action="store_true", help="augmented inference")
    parser.add_argument("--visualize", action="store_true", help="visualize features")
    parser.add_argument("--update", action="store_true", help="update all models")
    parser.add_argument("--project", default=str(ROOT / "runs/detect"), help="save results to project/name")
    parser.add_argument("--name", default="exp", help="save results to project/name")
    parser.add_argument("--exist-ok", action="store_true", help="existing project/name ok, do not increment")
    parser.add_argument("--line-thickness", default=3, type=int, help="bounding box thickness (pixels)")
    parser.add_argument("--hide-labels", action="store_true", default=False, help="hide labels")
    parser.add_argument("--hide-conf", action="store_true", default=False, help="hide confidences")
    parser.add_argument("--half", action="store_true", help="use FP16 half-precision inference")
    parser.add_argument("--dnn", action="store_true", help="use OpenCV DNN for ONNX inference")
    parser.add_argument("--vid-stride", type=int, default=1, help="video frame-rate stride")

    opt = parser.parse_args()
    # If only one size is provided, duplicate it for height and width
    if len(opt.imgsz) == 1:
        opt.imgsz *= 2
    return opt  # Return the modified opt instead of parsing args again


