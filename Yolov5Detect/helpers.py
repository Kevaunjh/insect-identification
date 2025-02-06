import os
import sys
import pkg_resources

def check_requirements(requirements_path="requirements.txt", exclude=None):
    """
    Check if the required packages listed in a requirements file are installed.

    Args:
        requirements_path (str): Path to the requirements file.
        exclude (tuple, optional): Tuple of package names to exclude from the check.
    """
    if exclude is None:
        exclude = ()
    if not os.path.exists(requirements_path):
        print(f"Requirements file {requirements_path} not found.")
        return
    with open(requirements_path, "r") as file:
        lines = file.readlines()
    required_packages = [line.strip() for line in lines if line.strip() and not line.startswith("#")]
    if exclude:
        required_packages = [pkg for pkg in required_packages if not any(excl in pkg for excl in exclude)]
    installed_packages = {pkg.key: pkg.version for pkg in pkg_resources.working_set}
    missing = []
    for req in required_packages:
        pkg_name = req.split("==")[0].lower()
        if pkg_name not in installed_packages:
            missing.append(req)
    if missing:
        print("The following required packages are missing:")
        for pkg in missing:
            print(f"  - {pkg}")
        print("Please install them using pip (e.g., pip install package_name).")
    else:
        print("All requirements satisfied.")


def print_args(args_dict):
    """
    Print command-line arguments in a formatted manner.

    Args:
        args_dict (dict): Dictionary of arguments.
    """
    print("Command-line arguments:")
    for key, value in args_dict.items():
        print(f"  {key}: {value}")
