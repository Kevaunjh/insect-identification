import os
import sys
import time
import csv
import json
import random
import base64
import platform
from pathlib import Path
from datetime import datetime

import torch
import cv2

from ultralytics.utils.plotting import Annotator, colors, save_one_box
from models.common import DetectMultiBackend
from utils.dataloaders import IMG_FORMATS, VID_FORMATS, LoadImages, LoadScreenshots, LoadStreams
from utils.general import (
    LOGGER,
    Profile,
    check_file,
    check_img_size,
    check_imshow,
    increment_path,
    non_max_suppression,
    print_args,
    scale_boxes,
    strip_optimizer,
    xyxy2xywh,
)
from utils.torch_utils import select_device, smart_inference_mode

from config import ROOT, MIN_CONFIDENCE
from database import save_to_db, upload_offline_data

# Global variable to track connection status
just_connected = False

@smart_inference_mode()
def run(
    weights=ROOT / "insectmodel/best.pt",
    source=ROOT / "0",
    data=ROOT / "data/coco128.yaml",
    imgsz=(640, 640),
    conf_thres=0.25,
    iou_thres=0.45,
    max_det=1000,
    device="",
    view_img=False,
    save_txt=False,
    save_format=0,
    save_csv=False,
    save_conf=False,
    save_crop=False,
    nosave=False,
    classes=None,
    agnostic_nms=False,
    augment=False,
    visualize=False,
    update=False,
    project=ROOT / "runs/detect",
    name="exp",
    exist_ok=False,
    line_thickness=3,
    hide_labels=False,
    hide_conf=False,
    half=False,
    dnn=False,
    vid_stride=1,
):
    """
    Runs YOLOv5 detection inference on various sources (images, videos, streams, etc.).

    Args:
        weights (str|Path): Path to the model weights.
        source (str|Path): Source input (file, directory, URL, webcam).
        data (str|Path): Dataset configuration file.
        imgsz (tuple[int, int]): Inference image size.
        conf_thres (float): Confidence threshold.
        iou_thres (float): IoU threshold for non-max suppression.
        max_det (int): Maximum detections per image.
        device (str): Device identifier.
        view_img (bool): Display results.
        save_txt (bool): Save results as text files.
        save_format (int): Format of saved boxes (YOLO or Pascal-VOC).
        save_csv (bool): Save results in CSV format.
        save_conf (bool): Save confidences in labels.
        save_crop (bool): Save cropped prediction boxes.
        nosave (bool): Do not save images/videos.
        classes (list[int]): Filter by class.
        agnostic_nms (bool): Class-agnostic NMS.
        augment (bool): Augmented inference.
        visualize (bool): Visualize features.
        update (bool): Update model weights.
        project (str|Path): Directory to save results.
        name (str): Name of the run.
        exist_ok (bool): Reuse existing directory.
        line_thickness (int): Bounding box thickness.
        hide_labels (bool): Hide labels on boxes.
        hide_conf (bool): Hide confidences on boxes.
        half (bool): Use FP16 precision.
        dnn (bool): Use OpenCV DNN for inference.
        vid_stride (int): Video frame stride.
    """
    source = str(source)
    save_img = not nosave and not source.endswith(".txt")
    is_file = Path(source).suffix[1:] in (IMG_FORMATS + VID_FORMATS)
    is_url = source.lower().startswith(("rtsp://", "rtmp://", "http://", "https://"))
    webcam = source.isnumeric() or source.endswith(".streams") or (is_url and not is_file)
    screenshot = source.lower().startswith("screen")
    if is_url and is_file:
        source = check_file(source)

    # Create directory for saving results
    save_dir = increment_path(Path(project) / name, exist_ok=exist_ok)
    (save_dir / "labels" if save_txt else save_dir).mkdir(parents=True, exist_ok=True)

    # Load model
    device = select_device(device)
    model = DetectMultiBackend(weights, device=device, dnn=dnn, data=data, fp16=half)
    stride, names, pt = model.stride, model.names, model.pt
    imgsz = check_img_size(imgsz, s=stride)

    # Initialize dataloader
    bs = 1
    if webcam:
        view_img = check_imshow(warn=True)
        dataset = LoadStreams(source, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
        bs = len(dataset)
    elif screenshot:
        dataset = LoadScreenshots(source, img_size=imgsz, stride=stride, auto=pt)
    else:
        dataset = LoadImages(source, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
    vid_path, vid_writer = [None] * bs, [None] * bs

    # Warmup model
    model.warmup(imgsz=(1 if pt or model.triton else bs, 3, *imgsz))
    seen, dt = 0, (Profile(device=device), Profile(device=device), Profile(device=device))
    start_counter = 0

    # Upload any offline data if online
    upload_offline_data()

    for path, im, im0s, vid_cap, s in dataset:
        with dt[0]:
            im = torch.from_numpy(im).to(model.device)
            im = im.half() if model.fp16 else im.float()
            im /= 255
            if len(im.shape) == 3:
                im = im[None]
            if model.xml and im.shape[0] > 1:
                ims = torch.chunk(im, im.shape[0], 0)

        # Inference
        with dt[1]:
            visualize_path = increment_path(save_dir / Path(path).stem, mkdir=True) if visualize else False
            if model.xml and im.shape[0] > 1:
                pred = None
                for image in ims:
                    if pred is None:
                        pred = model(image, augment=augment, visualize=visualize_path).unsqueeze(0)
                    else:
                        pred = torch.cat((pred, model(image, augment=augment, visualize=visualize_path).unsqueeze(0)), dim=0)
                pred = [pred, None]
            else:
                pred = model(im, augment=augment, visualize=visualize_path)

        # Non-Max Suppression
        with dt[2]:
            pred = non_max_suppression(pred, conf_thres, iou_thres, classes, agnostic_nms, max_det=max_det)

        # CSV logging function
        csv_path = save_dir / "predictions.csv"
        def write_to_csv(image_name, prediction, confidence):
            data_csv = {"Image Name": image_name, "Prediction": prediction, "Confidence": confidence}
            file_exists = os.path.isfile(csv_path)
            with open(csv_path, mode="a", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=data_csv.keys())
                if not file_exists:
                    writer.writeheader()
                writer.writerow(data_csv)

        # Process predictions per image
        for i, det in enumerate(pred):
            seen += 1
            if webcam:
                p, im0, frame = path[i], im0s[i].copy(), dataset.count
                s += f"{i}: "
            else:
                p, im0, frame = path, im0s.copy(), getattr(dataset, "frame", 0)

            p = Path(p)
            save_path = str(save_dir / p.name)
            txt_path = str(save_dir / "labels" / p.stem) + ("" if getattr(dataset, "mode", "image") == "image" else f"_{frame}")
            s += "{:g}x{:g} ".format(*im.shape[2:])
            gn = torch.tensor(im0.shape)[[1, 0, 1, 0]]
            imc = im0.copy() if save_crop else im0
            annotator = Annotator(im0, line_width=line_thickness, example=str(names))
            if len(det):
                # Rescale boxes to original image size
                det[:, :4] = scale_boxes(im.shape[2:], det[:, :4], im0.shape).round()

                for c in det[:, 5].unique():
                    n = (det[:, 5] == c).sum()
                    s += f"{n} {names[int(c)]}{'s' * (n > 1)}, "

                for *xyxy, conf, cls in reversed(det):
                    c = int(cls)
                    species_name = names[c]
                    label = names[c] if hide_conf else f"{names[c]}"
                    confidence_val = float(conf)
                    confidence_str = f"{confidence_val:.2f}"

                    if save_csv:
                        write_to_csv(p.name, label, confidence_str)

                    if save_txt:
                        if save_format == 0:
                            coords = (xyxy2xywh(torch.tensor(xyxy).view(1, 4)) / gn).view(-1).tolist()
                        else:
                            coords = (torch.tensor(xyxy).view(1, 4) / gn).view(-1).tolist()
                        line = (cls, *coords, conf) if save_conf else (cls, *coords)
                        with open(f"{txt_path}.txt", "a") as f:
                            f.write(("%g " * len(line)).rstrip() % line + "\n")

                    if save_img or save_crop or view_img:
                        label_disp = None if hide_labels else (names[c] if hide_conf else f"{names[c]} {confidence_val:.2f}")
                        annotator.box_label(xyxy, label_disp, color=colors(c, True))
                    if save_crop:
                        save_one_box(xyxy, imc, file=save_dir / "crops" / names[c] / f"{p.stem}.jpg", BGR=True)

                    # For images with sufficient confidence, save and upload
                    if save_img and confidence_val > 0.7:
                        if getattr(dataset, "mode", "image") == "stream":
                            if start_counter >= 30:  # Approximately every 10 seconds for a 3 FPS stream
                                save_img_path = str(Path(save_path).with_suffix(".jpg"))
                                cv2.imwrite(save_img_path, im0)
                                save_to_db(species_name, save_img_path, confidence_val)
                                start_counter = 0
                        else:
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
            start_counter += 1

            # Display results if enabled
            im0 = annotator.result()
            if view_img:
                if platform.system() == "Linux":
                    cv2.namedWindow(str(p), cv2.WINDOW_NORMAL | cv2.WINDOW_KEEPRATIO)
                    cv2.resizeWindow(str(p), im0.shape[1], im0.shape[0])
                cv2.imshow(str(p), im0)
                cv2.waitKey(1)

            LOGGER.info(f"{s}{'(no detections), ' if not len(det) else ''}{dt[1].dt * 1e3:.1f}ms")

    # Final logging
    t = tuple(x.t / seen * 1e3 for x in dt)
    LOGGER.info(f"Speed: {t[0]:.1f}ms pre-process, {t[1]:.1f}ms inference, {t[2]:.1f}ms NMS per image at shape {(1, 3, *imgsz)}")
    if save_txt or save_img:
        msg = f"\n{len(list(save_dir.glob('labels/*.txt')))} labels saved to {save_dir / 'labels'}" if save_txt else ""
        LOGGER.info(f"Results saved to {save_dir}{msg}")
    if update:
        strip_optimizer(weights[0])
