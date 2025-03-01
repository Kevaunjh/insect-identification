import subprocess

def run_command(command):
    try:
        subprocess.run(command, shell=True, check=True, text=True)
    except subprocess.CalledProcessError as e:
        print(f"Error executing {command}: {e}")

def reset_camera():
      print("Resetting camera module...")

      run_command("sudo modprobe -r uvcvideo")

        # Reload the UVC driver
      run_command("sudo modprobe uvcvideo")

            # Set display variable
      run_command("export DISPLAY=:0")

      print("Camera reset complete!")

      run_command("python detect.py")

      print("Starting the detect")

if __name__ == "__main__":
      reset_camera()
