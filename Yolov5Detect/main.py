from config import parse_opt
from detection import run
from helpers import check_requirements


def main():
    """
    Entry point for YOLOv5 object detection.
    Parses arguments, checks requirements, and runs inference.
    """
    opt = parse_opt()
    check_requirements()
    run(**vars(opt))


if __name__ == "__main__":
    main()
