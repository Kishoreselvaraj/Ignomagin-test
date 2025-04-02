import minimalmodbus

# Configure the Modbus connection
SERVO_ADDRESS = 1  # Change as needed
SERIAL_PORT = "COM17"  # Change for Windows (e.g., "COM3")
BAUDRATE = 38400  # Change if needed

# Create Modbus instrument
servo = minimalmodbus.Instrument(SERIAL_PORT, SERVO_ADDRESS)
servo.serial.baudrate = BAUDRATE
servo.serial.timeout = 1
servo.mode = minimalmodbus.MODE_RTU

def set_velocity_mode(speed):
    """Set the servo drive to velocity mode and assign speed"""
    servo.write_register(0x0003, 1, functioncode=6)  # Pr0.01: Set control mode to Velocity (1)
    servo.write_register(0x0309, speed, functioncode=6)  # Pr3.04: Set velocity speed
    print(f"Velocity mode set with speed {speed}")

def set_position_mode(position):
    """Set the servo drive to position mode and assign position"""
    servo.write_register(0x0003, 0, functioncode=6)  # Pr0.01: Set control mode to Position (0)
    servo.write_register(0x0B14, position >> 16, functioncode=6)  # PrB.20: Set position (High Byte)
    servo.write_register(0x0B15, position & 0xFFFF, functioncode=6)  # PrB.20: Set position (Low Byte)
    print(f"Position mode set with target position {position}")

def set_jog_mode(speed):
    """Enable JOG mode and assign speed"""
    servo.write_register(0x6027, speed, functioncode=6)  # Pr8.39: JOG velocity
    servo.write_register(0x6028, 100, functioncode=6)  # Pr8.40: JOG acceleration
    servo.write_register(0x6029, 100, functioncode=6)  # Pr8.41: JOG deceleration
    #servo.write_register(devAddr, REGISTER_CONTROL_WORD, 0x4002)  # jog ClockWise send every50ms
    #servo.write_register(devAddr, REGISTER_CONTROL_WORD, 0x4001)  # jog ClockWise send every50ms


    print(f"JOG mode set with speed {speed}")

# Example Usage
if __name__ == "__main__":

    #while True:
        #set_velocity_mode(500)  # Set to velocity mode with speed 500
    set_position_mode(10000)  # Set to position mode with position 10000
        #set_jog_mode(300)  # Set to JOG mode with speed 300
