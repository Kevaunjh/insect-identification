import serial
import time

def read_serial_data(port='/dev/ttyUSB2', baudrate=9600, timeout=1, retries=5):
    """
    Reads data from the specified serial port.

    Args:
        port (str): The serial port to connect to (default is '/dev/ttyUSB2').
        baudrate (int): The baud rate for the serial connection (default is 9600).
        timeout (int): Timeout duration for reading (default is 1 second).
        retries (int): Number of retries to attempt if no data is received (default is 5).

    Returns:
        str: The raw serial data as a string, or None if no data is available after retries.
    """
    serialInst = serial.Serial()
    serialInst.baudrate = baudrate
    serialInst.port = port
    serialInst.timeout = timeout

    try:
        serialInst.open()
    except serial.SerialException:
        return None

    if serialInst.is_open:
        for attempt in range(retries):
            try:
                if serialInst.in_waiting:
                    packet = serialInst.readline()
                    packet_str = packet.decode('utf-8', errors='ignore').rstrip('\n')
                    return packet_str
                time.sleep(1)
            except Exception:
                break

        return None
    else:
        return None

