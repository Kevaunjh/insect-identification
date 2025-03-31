import serial
import time
import traceback

def read_serial_data(ports=['/dev/ttyUSB1', '/dev/ttyUSB2'], baudrate=9600, timeout=1, retries=5):
    """
    Robustly reads data from specified serial ports.

    Args:
        ports (list): List of serial ports to try connecting to.
        baudrate (int): The baud rate for the serial connection.
        timeout (int): Timeout duration for reading.
        retries (int): Number of retries to attempt if no data is received.

    Returns:
        dict: A dictionary containing sensor data, or None if no data is available.
    """
    for port in ports:
        serialInst = serial.Serial()
        serialInst.baudrate = baudrate
        serialInst.port = port
        serialInst.timeout = timeout

        try:
            # Attempt to open the port
            serialInst.open()
        except (serial.SerialException, PermissionError) as e:
            print(f"Could not open port {port}: {e}")
            continue

        if serialInst.is_open:
            for attempt in range(retries):
                try:
                    # Check if data is available
                    if serialInst.in_waiting:
                        packet = serialInst.readline()
                        packet_str = packet.decode('utf-8', errors='ignore').rstrip('\n')
                        
                        # Parse the packet
                        try:
                            # Assuming the data format is 'longitude, latitude, temp, light'
                            longitude, latitude, temp, light = packet_str.split(', ')
                            return {
                                'longitude': longitude,
                                'latitude': latitude,
                                'temperature': temp,
                                'light': light
                            }
                        except ValueError:
                            print(f"Incorrect data format on port {port}: {packet_str}")
                            continue

                    time.sleep(1)
                except Exception as e:
                    print(f"Error reading from port {port}: {e}")
                    traceback.print_exc()
                    break
                
            # Close the port after attempts
            serialInst.close()

    # If no data found on any port
    print("No valid serial data found on specified ports.")
    return None

def continuous_serial_read(interval=10):
    """
    Continuously read serial data at specified intervals.
    
    Args:
        interval (int): Number of seconds between read attempts.
    """
    while True:
        data = read_serial_data()
        if data:
            print("Serial Data:", data)
        time.sleep(interval)

# Example usage
if __name__ == "__main__":
    try:
        continuous_serial_read()
    except KeyboardInterrupt:
        print("Serial reading stopped.")