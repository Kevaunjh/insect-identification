import os
os.environ['DISPLAY'] = ':0'
import subprocess
import signal
import threading
import time
import pyautogui
import psutil
from detect import reset_arm_position
from detect import stop_moving
# Set the environment for display
os.environ['DISPLAY'] = ':0'

detect_process = None
pause_event = threading.Event()
roslaunch_process = None  # Make roslaunch_process a global variable

def run_command(command, use_display=False):
    env = os.environ.copy()
    if use_display:
        env["DISPLAY"] = ":0"
    else:
        env.pop("DISPLAY", None)
    try:
        subprocess.run(command, shell=True, check=True, text=True, env=env)
    except subprocess.CalledProcessError as e:
        print(f"Error executing {command}: {e}")

def reset_camera():
    print("Resetting camera module...")
    run_command("sudo fuser -k /dev/video*")
    time.sleep(1)
    run_command("sudo modprobe -r uvcvideo")
    time.sleep(1)
    run_command("sudo modprobe uvcvideo")
    time.sleep(1)
    print("Camera reset complete!")

def start_roslaunch():
    global roslaunch_process  # Declare roslaunch_process as global
    print("Starting ROS launch...")
    os.environ['DISPLAY'] = ':0'

    # Export ROS environment variables
    run_command("export ROS_MASTER_URI=http://localhost:11311")  # Set the correct ROS Master URI
    run_command("export ROS_IP=192.168.1.11")  # Use your local IP address
    time.sleep(2)
    roslaunch_command = "roslaunch yahboomcar_linefollw follow_line.launch VideoSwitch:=true img_flip:=false"
    roslaunch_process = subprocess.Popen(roslaunch_command, shell=True, env=os.environ)
    print("ROS launch started.")
    time.sleep(7)
    reset_arm_position()
    time.sleep(2)
    try:
        pyautogui.press('space')
        print("Spacebar pressed")
    except Exception as e:
        print(f"Error pressing spacebar: {e}")
    return roslaunch_process

def kill_process_tree(process):
    """Terminate the given process and its children."""
    parent = psutil.Process(process.pid)
    for child in parent.children(recursive=True):
        child.terminate()  # Terminate each child
    parent.terminate()  # Terminate the parent process
    stop_moving()
    print("ROS launch process and children terminated.")

def restart_roslaunch():
    global roslaunch_process  # Declare roslaunch_process as global
    """Restart the ROS launch process."""
    print("Restarting ROS launch...")
    return start_roslaunch()

def start_detection(roslaunch_process):
    global detect_process  # Declare detect_process as global
    print("Starting detection script...")
    run_command("export QT_QPA_PLATFORM=xcb")
    detect_process = subprocess.Popen("python detect.py", shell=True, stdout=subprocess.PIPE, text=True)
    print(f"detect.py started with PID: {detect_process.pid}")

    while True:
        output = detect_process.stdout.readline()
        if not output:
            break
        output = output.strip()

        if "LOCATED" in output:
            print("[INFO] Detection found, stopping ROS launch process")
            time.sleep(1)  # Allow some time for process to handle
            pause_event.clear()  # Disable the event (to stop ROS)
            kill_process_tree(roslaunch_process)  # Kill the ROS launch process
            stop_moving()

        elif "FINISHED" in output:
            time.sleep(2)
            pause_event.set()  # Enable the event (to restart ROS)
            print("[INFO] Detection finished, restarting ROS launch process")
            roslaunch_process = restart_roslaunch()  # Restart the ROS launch process

    detect_process.stdout.close()
    detect_process.wait()  # Wait for the process to finish completely

def monitor_pause():
    while True:
        pause_event.wait()  # Block until event is set
        time.sleep(1)

def stop_detection():
    global detect_process  # Declare detect_process as global
    if detect_process and detect_process.poll() is None:
        detect_process.terminate()
        detect_process.wait()

def cleanup(signum=None, frame=None):
    stop_detection()
    exit(0)

signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

if __name__ == "__main__":
    try:
        # Reset the camera before starting
        camera_thread = threading.Thread(target=reset_camera)
        camera_thread.start()
        camera_thread.join()

        # Start the ROS launch process
        roslaunch_process = start_roslaunch()
        pause_event.set()  # Allow the ROS process to run

        # Start detection in another thread, passing roslaunch_process
        detection_thread = threading.Thread(target=start_detection, args=(roslaunch_process,))
        detection_thread.start()

        # Monitor pause/resume state
        monitor_thread = threading.Thread(target=monitor_pause)
        monitor_thread.start()

        # Keep the main thread alive
        while True:
            time.sleep(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        cleanup()

