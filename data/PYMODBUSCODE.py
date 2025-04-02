#!/usr/bin/env python
from pymodbus.client.sync import ModbusSerialClient
import math
import time
import serial.tools.list_ports
import logging
from hardwareCSV import *
import keyboard

logging.basicConfig()
log = logging.getLogger()
log.setLevel(logging.INFO)


# --------------------------
# Configuration and Constants
# --------------------------

BAUDRATE = 38400
TIMEOUT = 1

# Define your register addresses (same as before)
# Register addresses
REGISTER_PULSE_PER_REV = 0x0001
REGISTER_ENCODER_VALUEL = 0x1014
REGISTER_ENCODER_VALUEH = 0x1015
REGISTER_CONTROL_MODE = 0x0003
REGISTER_MOTOR_DIRECTION = 0x0007
REGISTER_MOTOR_INDUCTANCE = 0x0009
REGISTER_MAX_POSITION_ERROR = 0x000B
REGISTER_CONTROL_WORD = 0x1801
REGISTER_CURRENT_ALARM = 0x2203
REGISTER_MOTION_STATUS = 0x1003
REGISTER_MOTION_DIRECTION = 0x0007
REGISTER_JOG_VELOCITY = 0x01E1
REGISTER_JOG_ACCELERATION = 0x01E7
REGISTER_HOMING = 0x014B
REGISTER_HOLDING_TORQUE = 0x0193

# Absolute PR MODE
PR_DECELERATION = 0x6205
PR_ACCELERATION = 0x6204
PR_VELOCITY = 0x6203
ABS_PR_HIGHBIT = 0x6201
ABS_PR_LOWBIT = 0x6202
PR_TRIG = 0x6002  # send 0x10 for clockwise and 0x10 & 0xFFFF for CCW, send 0x11 for cw and 0x11 & 0xFFFF for ccw

# INCREMENTAL PR MODE
INCREMENTAL_PR_HIGHBIT = 0x6209
INCREMENTAL_PR_LOWBIT = 0x620A
INCREMENTAL_ACCELERATION = 0x620C
INCREMENTAL_DECCELERATION = 0x620D
INCREMENTAL_VELOCITY = 0x620B
REGISTER_POSITION_FOLLOWING_ERROR = 0x1010  # Position following error
REGISTER_PROFILE_POSITION = 0x1012  # Current commanded position
REGISTER_FEEDBACK_POSITION = 0x1014  # Actual encoder position value
REGISTER_STATUS_WORD = 0x1003  # Motion status word
REGISTER_IO_STATUS = 0x0179  # Digital input status
REGISTER_IO_OUTPUT = 0x017B  # Digital output status
REGISTER_S_CODE = 0x601C  # S-code current output value
# ... (include all registers you need)


# ______________
# scan the available modbus PORT
# ______________
def list_serial_ports():
    """Returns a list of available serial port device names."""
    ports = serial.tools.list_ports.comports()
    return [port.device for port in ports]

def ping_modbus_on_port(port, baudrate=38400, timeout=1):
    client = ModbusSerialClient(method='rtu', port=port, baudrate=baudrate, timeout=timeout)
    if client.connect():
        try:
            # Send a read request to slave 1 (commonly used default)
            response = client.read_holding_registers(0, 1, unit=1)
            if not response.isError():
                return True
        except Exception as e:
            print(f"Error on port {port}: {e}")
        finally:
            client.close()
    return False


def scanHardwarePort():
    global MODBUS_PORT
    ports = list_serial_ports()
    if not ports:
        print("No serial ports found.")
        return None

    MODBUS_PORT = None
    # Find the first port that responds to a Modbus ping
    for port in ports:
        if ping_modbus_on_port(port):
            MODBUS_PORT = port
            break

    if not MODBUS_PORT:
        print("No Modbus device responded on any port.")
        return None

    client = ModbusSerialClient(method='rtu', port=MODBUS_PORT, baudrate=38400, timeout=1)
    try:
        if not client.connect():
            raise Exception("Unable to connect to the Modbus device!")

        rps = client.read_holding_registers(0x001, 1, unit=1)
        if rps.isError():
            raise Exception("Error reading registers from the Modbus device!")

        # Use the first register value as verification data
        vrfData = rps.registers[0]
        # print(MODBUS_PORT)
        if vrfData == 4000:
            return MODBUS_PORT
        else:
            raise Exception("Verification data does not match expected value.")
    except Exception as e:
        print("Error scanning hardware port:", e)
        MODBUS_PORT = None
        return None
    finally:
        client.close()


SERIAL_PORT = scanHardwarePort()  # Adjust to your serial port

# --------------------------
# Setup the pymodbus client
# --------------------------
if SERIAL_PORT != None:
    client = ModbusSerialClient(method='rtu', port=SERIAL_PORT, baudrate=BAUDRATE, timeout=TIMEOUT)
    if not client.connect():
        raise Exception("Unable to connect to the Modbus device!")
else:
    print("Error connecting to Hardware")
    exit(0)

# --------------------------
# Helper Functions (read/write)
# --------------------------
def read_register(device_address, register_address, count=1):
    """
    Read a register using pymodbus.
    """
    response = client.read_holding_registers(register_address, count, unit=device_address)
    if response.isError():
        print(f"Error reading from register 0x{register_address:04X}: {response}")
        return None
    return response.registers[0] if count == 1 else response.registers

def write_register(device_address, register_address, value):
    global readFlag
    """
    Write a register using pymodbus.
    """
    readFlag = False
    response = client.write_register(register_address, value, unit=device_address)
    if response.isError():
        print(f"Error writing value {value} to register 0x{register_address:04X}: {response}")
        return False
    readFlag = True
    return True

# --------------------------
# Example Conversion of Some Functions
# --------------------------
def readPPR(device_address):
    """
    Read Pulse Per Revolution (PPR); default to 4000 if None.
    """
    ppr = read_register(device_address, REGISTER_PULSE_PER_REV)
    return 4000 if ppr is None else ppr

def jogMotor(devAddr, direction):
    """
    Send jog command based on direction.
    """
    if direction == "+":
        # For example, using a control word to jog clockwise
        return write_register(devAddr, REGISTER_CONTROL_WORD, 0x4002)
    elif direction == "-":
        # For counter-clockwise
        return write_register(devAddr, REGISTER_CONTROL_WORD, 0x4001)
    else:
        print("Invalid direction. Use '+' or '-'")
        return False

def readEncoder(device_address):
    """
    Read a 32-bit encoder value composed of two 16-bit registers.
    """
    lsb = read_register(device_address, REGISTER_ENCODER_VALUEL)
    msb = read_register(device_address, REGISTER_ENCODER_VALUEH)
    if lsb is None or msb is None:
        return None
    val = (lsb << 16) | msb
    # Adjust for signed 32-bit value if necessary
    if val & (1 << 31):
        val -= (1 << 32)
    return val
def EncoderActualPostion(dvAddr):
    lsb = read_register(dvAddr, 0x602C)
    msb = read_register(dvAddr, 0x602D)
    val_reverse = (lsb << 16) | msb
    if val_reverse & (1 << 31):
        val_reverse -= (1 << 32)
    return val_reverse

def triggerHoming(deviceAddr):
    write_register(deviceAddr, PR_TRIG, 0x21)


def resetEncoder(device_address):
    write_register(device_address, REGISTER_ENCODER_VALUEL, 0)
    write_register(device_address, REGISTER_ENCODER_VALUEH, 0)

def motorMove(Velocity, acc, dcc, LSteps, RSteps, Mode):
    """
    Example conversion for a motor move function.
    This function writes to both motors.
    """
    # Convert steps to proper 32-bit representation
    LSteps = int(LSteps)
    RSteps = int(RSteps)
    negLSteps = -LSteps

    # Prepare 32-bit values (split into two 16-bit registers)
    def split_value(val):
        unsigned_val = (val + (1 << 32)) % (1 << 32)
        return (unsigned_val >> 16, unsigned_val & 0xFFFF)

    Rmsb, Rlsb = split_value(negLSteps)
    Lmsb, Llsb = split_value(RSteps)

    try:
        # Write incremental target positions
        write_register(RIGHT_MOTOR, 0x6209, Rmsb)
        write_register(LEFT_MOTOR,  0x6209, Lmsb)
        write_register(RIGHT_MOTOR, 0x620A, Rlsb)
        write_register(LEFT_MOTOR,  0x620A, Llsb)
        # Write absolute target positions (if needed)
        write_register(RIGHT_MOTOR, 0x6201, Rmsb)
        write_register(LEFT_MOTOR,  0x6201, Lmsb)
        write_register(RIGHT_MOTOR, 0x6202, Rlsb)
        write_register(LEFT_MOTOR,  0x6202, Llsb)
        # Write velocity, acceleration, and deceleration
        for reg, value in [(0x620B, Velocity), (0x620C, acc), (0x620D, dcc)]:
            write_register(RIGHT_MOTOR, reg, value)
            write_register(LEFT_MOTOR,  reg, value)
        # Trigger motion command based on mode
        if Mode == "INC":
            trigger_val = 0x11
        elif Mode == "ABS":
            trigger_val = 0x10
        else:
            trigger_val = 0x11
        write_register(RIGHT_MOTOR, 0x6002, trigger_val)
        write_register(LEFT_MOTOR,  0x6002, trigger_val)

        return True
    except Exception as e:
        print(f"Error in motorMove: {e}")
        return False




def check_completion():
    status = read_register(RIGHT_MOTOR, REGISTER_MOTION_STATUS)
    status2 = read_register(LEFT_MOTOR, REGISTER_MOTION_STATUS)
    pr_complete = bool(status & (1 << 5)) if status is not None else False
    pr2_complete = bool(status2 & (1 << 5)) if status2 is not None else False
    return pr_complete and pr2_complete

def updateVelocity(v):
    s1 = write_register(RIGHT_MOTOR, INCREMENTAL_VELOCITY, v)
    s2 = write_register(LEFT_MOTOR, INCREMENTAL_VELOCITY, v)
    s3 = write_register(RIGHT_MOTOR, PR_VELOCITY, v)
    s4 = write_register(LEFT_MOTOR, PR_VELOCITY, v)
    return s1 and s2 and s3 and s4

def readGPIO(device_address, pin_number):
    input_states = read_register(device_address, REGISTER_IO_STATUS)
    if input_states is None:
        return None
    return bool(input_states & (1 << (pin_number - 1)))

def setPRCompletion(device_address):
    current_status = read_register(device_address, REGISTER_MOTION_STATUS)
    if current_status is None:
        return False
    new_status = current_status | (1 << 5)
    return write_register(device_address, REGISTER_MOTION_STATUS, new_status)

def getMotionStatus(device_address):
    status = read_register(device_address, REGISTER_STATUS_WORD)
    if status is None:
        return {}
    return {
        'fault': bool(status & 0x01),
        'enable': bool(status & 0x02),
        'running': bool(status & 0x04),
        'cmd_complete': bool(status & 0x10),
        'path_complete': bool(status & 0x20),
        'homing_complete': bool(status & 0x40)
    }

def getPositionError(device_address):
    lsb = read_register(device_address, REGISTER_POSITION_FOLLOWING_ERROR)
    msb = read_register(device_address, REGISTER_POSITION_FOLLOWING_ERROR + 1)
    if lsb is None or msb is None:
        return None
    return combine_value(msb, lsb)

def configureInputFilter(device_address, input_num, filter_time_ms):
    valid_times = [1, 2, 3, 4, 5, 6, 8, 15, 20, 30, 40, 50, 100, 200, 500]
    if filter_time_ms not in valid_times:
        raise ValueError("Invalid filter time")
    filter_map = {1: 0x0100, 2: 0x0200, 3: 0x0300, 4: 0x0400, 5: 0x0500,
                  6: 0x0600, 8: 0x0700, 15: 0x0800, 20: 0x0900, 30: 0x0A00,
                  40: 0x0B00, 50: 0x0C00, 100: 0x0D00, 200: 0x0E00, 500: 0x0F00}
    base_reg = 0x0145
    reg = base_reg + (input_num - 1) * 2
    current = read_register(device_address, reg)
    new_value = (current & 0x00FF) | filter_map[filter_time_ms]
    write_register(device_address, reg, new_value)

def configurePRPathAdvanced(device_address, path_num, params):
    base_reg = 0x6200 + path_num * 8
    ctrl = 0
    mode = params.get('mode')
    if mode == 'position':
        ctrl |= 0x01
    elif mode == 'velocity':
        ctrl |= 0x02
    elif mode == 'homing':
        ctrl |= 0x03
    if params.get('interrupt'):
        ctrl |= (1 << 4)
    if params.get('overlap'):
        ctrl |= (1 << 5)
    if params.get('relative'):
        ctrl |= (1 << 6)
    if 'jump_path' in params:
        ctrl |= (params['jump_path'] & 0x0F) << 8
        ctrl |= (1 << 14)
    if not write_register(device_address, base_reg, ctrl):
        return False
    if 'position' in params:
        pos = params['position']
        msb, lsb = split_value(pos)
        if not write_register(device_address, base_reg + 1, msb):
            return False
        if not write_register(device_address, base_reg + 2, lsb):
            return False
    if 'velocity' in params:
        if not write_register(device_address, base_reg + 3, params['velocity']):
            return False
    if 'acceleration' in params:
        if not write_register(device_address, base_reg + 4, params['acceleration']):
            return False
    if 'deceleration' in params:
        if not write_register(device_address, base_reg + 5, params['deceleration']):
            return False
    return True

def configureSCode(device_address, path_num, start_code=None, end_code=None):
    register = 0x6030 + path_num
    value = 0
    if start_code is not None:
        value |= (start_code & 0xFF)
    if end_code is not None:
        value |= ((end_code & 0xFF) << 8)
    return write_register(device_address, register, value)

def getSCode(device_address):
    return read_register(device_address, REGISTER_S_CODE)

def configureIOTrigger(device_address, mode=2):
    return write_register(device_address, 0x601A, mode)

def is_device_available(device_address):
    val = read_register(device_address, REGISTER_PULSE_PER_REV)
    return val is not None
def close_client():
    client.close()


def interpret_alarm(alarm_value):
    if alarm_value == 0:
        return "No alarms."
    alarms = []
    troubleshooting = []
    alarm_codes = {
        0x01: ("Over-current", [
            "1. Restart the drive",
            "2. Check motor wiring"
        ]),
        0x02: ("Over-voltage", [
            "1. Restart the drive",
            "2. Check power supply voltage"
        ]),
        0x40: ("Current sampling circuit error", [
            "1. Restart the drive",
            "2. Hardware failure"
        ]),
        0x80: ("Shaft locking error", [
            "1. Check motor wiring"
        ]),
        0x200: ("EEPROM error", ["Hardware Failure"]),
        0x100: ("Auto tuning error", [
            "1. Restart the drive",
            "2. Contact support if persists"
        ]),
        0x20: ("Position following error", [
            "1. Check encoder resolution",
            "2. Check encoder cable",
            "3. Check limit switch",
            "4. Check acceleration parameters"
        ]),
        0x08: ("Encoder cable error", [
            "1. Check encoder cable",
            "2. Check for missing extension cable"
        ])
    }
    for code, (desc, steps) in alarm_codes.items():
        if alarm_value & code:
            alarms.append(desc)
            troubleshooting.extend(steps)
    if not alarms:
        return "Unknown alarm code."
    response = "Active Alarms: " + ", ".join(alarms)
    if troubleshooting:
        response += "\nTroubleshooting Steps:\n" + "\n".join(troubleshooting)
    return response

def readAlarm(right_device_address=RIGHT_MOTOR, left_device_address=LEFT_MOTOR):
    right_alarm_value = read_register(right_device_address, REGISTER_CURRENT_ALARM)
    left_alarm_value = read_register(left_device_address, REGISTER_CURRENT_ALARM)
    right_alarm_status = interpret_alarm(right_alarm_value) if right_alarm_value is not None else "Error"
    left_alarm_status = interpret_alarm(left_alarm_value) if left_alarm_value is not None else "Error"
    return f"Right Motor: {right_alarm_status}\nLeft Motor: {left_alarm_status}"

def angle2Distance(angle, radius=RADIUS):
    arc = (angle / 360.0) * 2 * math.pi * radius
    # Adjust with an offset if needed
    return arc - arc * 0.0655555555555556

def resetEncoder(device_address):
    write_register(device_address, REGISTER_ENCODER_VALUEL, 0)
    write_register(device_address, REGISTER_ENCODER_VALUEH, 0)

def rotate(angle, VEL, ACC, DCC, direction, MODE, shouldStore):
    angle = angle + TOLANG
    turn_dist = angle2Distance(abs(angle))
    if direction.lower() == 'l':
        return motorMoveDistance(VEL, ACC, DCC, turn_dist, -turn_dist, "mm", MODE, shouldStore)
    elif direction.lower() == 'r':
        return motorMoveDistance(VEL, ACC, DCC, -turn_dist, turn_dist, "mm", MODE, shouldStore)
    else:
        raise ValueError("Invalid direction! Use 'l' for left or 'r' for right.")


# Mapping of output ports to their Modbus register addresses
OUTPUT_REGISTERS = {
    "DO1": 0x0157,
    "DO2": 0x0159,
    "DO3": 0x015B,
}


def set_output_state_manual(device_address, output_port, state, manual_on_value=0xFF):
    """
    Sets a digital output port to ON or OFF in manual mode.

    By default, the CS2RS drive assigns internal status codes to digital outputs.
    To control the output manually, the output's function should be reconfigured
    (using your drive's parameters) for manual control. Then you can write a value
    that does not conflict with the internal status codes.

    Args:
        device_address (int): The Modbus slave address of the drive.
        output_port (str): The output port identifier, e.g., "DO1", "DO2", "DO3".
        state (bool): True to set the output ON, False to set it OFF.
        manual_on_value (int): The value to write to set the output high in manual mode.
                                (Default 0xFF is used as an example; adjust as needed.)

    Returns:
        bool: True if the write was successful, False otherwise.
    """
    if output_port not in OUTPUT_REGISTERS:
        print(f"Output port {output_port} is not recognized.")
        return False

    register = OUTPUT_REGISTERS[output_port]
    # Use manual_on_value for ON and 0 for OFF
    value = manual_on_value if state else 0x00
    if write_register(device_address, register, value):
        print(f"{output_port} manually set to {'ON' if state else 'OFF'} on device {device_address}.")
        return True
    else:
        print(f"Failed to set {output_port} manually on device {device_address}.")
        return False

def releaseMotors(MOTOR_ADDR):
    s1 = write_register(MOTOR_ADDR, REGISTER_HOLDING_TORQUE, 0)
    return s1

def holdMotors(MOTOR_ADDR,num):
    s1 = write_register(MOTOR_ADDR, REGISTER_HOLDING_TORQUE, num)
    return s1

def resetAlarm(device_address):
    write_register(device_address, REGISTER_CONTROL_WORD, 0x1111)  # Reset Alarm
def resetHistoryAlarm(device_address):
    write_register(device_address, REGISTER_CONTROL_WORD, 0x1122)  # Reset History Alarm
def readPPR(device_address):
    return read_register(device_address, REGISTER_PULSE_PER_REV)
def writePPR(device_address, num):
    write_register(device_address, REGISTER_PULSE_PER_REV, num)
def setJogVelAcc(device_addr, vel, acc):
    write_register(device_addr, REGISTER_JOG_VELOCITY, vel)
    write_register(device_addr, REGISTER_JOG_ACCELERATION, acc)

def check_pr_completion(MOTOR_ADDR):
    try:
        status = read_register(MOTOR_ADDR, REGISTER_MOTION_STATUS)

        pr_complete = bool(status & (1 << 5)) if status is not None else False
        return pr_complete
    except Exception as e:
        print("Error reading PR completion status:", e)
        return False

def split_value(val):
    """Split a 32-bit integer into two 16-bit registers."""
    unsigned_val = (val + (1 << 32)) % (1 << 32)
    msb = (unsigned_val >> 16) & 0xFFFF
    lsb = unsigned_val & 0xFFFF
    return msb, lsb

def combine_value(msb, lsb):
    """Combine two 16-bit registers into a 32-bit signed integer."""
    val = (msb << 16) | lsb
    if val & (1 << 31):
        val -= (1 << 32)
    return val

def disable_soft_limits(device_address):
    """
    Disables the soft limit function by clearing the appropriate bit
    (bit1 or bit0) in register 0x6000 (Pr8.00).
    """
    current_control = read_register(device_address, 0x6000)
    if current_control is None:
        print("Error reading PR control setting from register 0x6000.")
        return False

    # Example assumes bit1 is used for soft limit; change mask if your code sets bit0 instead
    new_control = current_control & ~0x0002

    if not write_register(device_address, 0x6000, new_control):
        print("Failed to update PR control setting to disable soft limit.")
        return False

    print("Soft limits have been disabled.")
    return True


def set_soft_limits(device_address, pos_limit, neg_limit, quick_stop_time=100):
    """
    Sets the soft limits for the drive using the following registers:
      - 0x6000 (Pr8.00): PR control setting (enable soft limit by setting bit1)
      - 0x6006 (Pr8.06): Soft limit+ H (positive limit high 16 bits)
      - 0x6007 (Pr8.07): Soft limit+ L (positive limit low 16 bits)
      - 0x6008 (Pr8.08): Soft limit- H (negative limit high 16 bits)
      - 0x6009 (Pr8.09): Soft limit- L (negative limit low 16 bits)
      - 0x6016 (Pr8.22): Soft limit quick stop time (deceleration time in ms)

    Parameters:
      device_address (int): The Modbus slave address of the drive.
      pos_limit (int): The positive soft limit value (32-bit integer, in pulses).
      neg_limit (int): The negative soft limit value (32-bit integer, in pulses).
      quick_stop_time (int, optional): The deceleration time in ms after triggering the soft limit.
                                        Default is 10 ms (nonzero to avoid illegal value errors).

    Returns:
      bool: True if all register writes succeed, False otherwise.
    """
    # Step 1: Enable soft limit function in PR control setting (register 0x6000)
    current_control = read_register(device_address, 0x6000)
    if current_control is None:
        print("Error reading PR control setting from register 0x6000.")
        return False

    # Enable soft limit by setting bit1 (mask 0x0002)
    new_control = current_control | 0x0001
    if not write_register(device_address, 0x6000, new_control):
        print("Failed to update PR control setting to enable soft limit.")
        return False

    # Step 2: Split the 32-bit soft limit values into high and low 16-bit parts.
    pos_high, pos_low = split_value(pos_limit)
    neg_high, neg_low = split_value(neg_limit)

    # Step 3: Write the positive soft limit registers.
    success_pos_h = write_register(device_address, 0x6006, pos_high)
    success_pos_l = write_register(device_address, 0x6007, pos_low)

    # Write the negative soft limit registers.
    success_neg_h = write_register(device_address, 0x6008, neg_high)
    success_neg_l = write_register(device_address, 0x6009, neg_low)

    # Step 4: Write the soft limit quick stop time.
    success_qs = write_register(device_address, 0x6016, quick_stop_time)

    if success_pos_h and success_pos_l and success_neg_h and success_neg_l and success_qs:
        print(
            f"Soft limits set successfully: +{pos_limit} pulses, {neg_limit} pulses with quick stop time {quick_stop_time} ms.")
        return True
    else:
        print("Failed to set one or more soft limit registers.")
        return False


# Example usage:
# Set a positive soft limit of 100000 pulses and a negative soft limit of -100000 pulses on device 1.
# set_soft_limits(1, 100000, -100000)


def wheel_circumference():
    return math.pi * WHEEL_DIA
def wheelRatio(UNIT):
    ppr = 4000
    unit = UNIT.lower()
    if unit == "mm":
        return ppr / wheel_circumference()
    elif unit == "cm":
        return ppr / (wheel_circumference()/10)
    elif unit == "inch":
        return ppr / (wheel_circumference()/25.4)
    elif unit == "feet":
        return ppr / (wheel_circumference()/304.8)
    elif unit == "m":
        return ppr / (wheel_circumference()/1000)
    else:
        raise ValueError("Unsupported unit. Choose from 'mm', 'cm', 'm', 'inch', 'feet'.")
def toSteps(Distance, UNIT):
    return int(Distance * wheelRatio(UNIT))

def motorMoveDistance(Velocity, acc, dcc, LDistance, RDistance, UNIT, Mode):
    LSteps = int(toSteps(LDistance, UNIT) * LEFT_MOTOR_GEAR)
    negLSteps = -1 * LSteps
    RSteps = int(toSteps(RDistance, UNIT) * RIGHT_MOTOR_GEAR)

    Rval = (negLSteps + (1 << 32)) % (1 << 32)
    Rmsb = (Rval >> 16)
    Rlsb = (Rval & 65535)
    Lval = (RSteps + (1 << 32)) % (1 << 32)
    Lmsb = (Lval >> 16)
    Llsb = (Lval & 65535)
    # print(negLSteps)
    # print(RSteps)
    try:
        write_register(RIGHT_MOTOR,INCREMENTAL_PR_HIGHBIT, Rmsb)
        write_register(LEFT_MOTOR,INCREMENTAL_PR_HIGHBIT, Lmsb)
        write_register(RIGHT_MOTOR,INCREMENTAL_PR_LOWBIT, Rlsb)
        write_register(LEFT_MOTOR,INCREMENTAL_PR_LOWBIT, Llsb)

        write_register(RIGHT_MOTOR,ABS_PR_HIGHBIT, Rmsb)
        write_register(LEFT_MOTOR,ABS_PR_HIGHBIT, Lmsb)
        write_register(RIGHT_MOTOR,ABS_PR_LOWBIT, Rlsb)
        write_register(LEFT_MOTOR,ABS_PR_LOWBIT, Llsb)

        write_register(RIGHT_MOTOR,INCREMENTAL_VELOCITY, Velocity)
        write_register(LEFT_MOTOR,INCREMENTAL_VELOCITY, Velocity)
        write_register(RIGHT_MOTOR,INCREMENTAL_ACCELERATION, acc)
        write_register(LEFT_MOTOR,INCREMENTAL_ACCELERATION, acc)
        write_register(RIGHT_MOTOR,INCREMENTAL_DECCELERATION, dcc)
        write_register(LEFT_MOTOR,INCREMENTAL_DECCELERATION, dcc)

        write_register(RIGHT_MOTOR,PR_VELOCITY, Velocity)
        write_register(LEFT_MOTOR,PR_VELOCITY, Velocity)
        write_register(RIGHT_MOTOR,PR_ACCELERATION, acc)
        write_register(LEFT_MOTOR,PR_ACCELERATION, acc)
        write_register(RIGHT_MOTOR,PR_DECELERATION, dcc)
        write_register(LEFT_MOTOR,PR_DECELERATION, dcc)
        if Mode == "INC":
            write_register(RIGHT_MOTOR,PR_TRIG, 0x11)
            write_register(LEFT_MOTOR,PR_TRIG, 0x11)

        elif Mode == "ABS":
            write_register(RIGHT_MOTOR,PR_TRIG, 0x10)
            write_register(LEFT_MOTOR,PR_TRIG, 0x10)
        else:
            write_register(RIGHT_MOTOR,PR_TRIG, 0x11)
            write_register(LEFT_MOTOR,PR_TRIG, 0x11)
    except Exception as e:
        print("Error in motorMoveDistance:", e)
        return False

def omniRotate(Velocity, acc, dcc, LAngle, RAngle, Mode):
    """
    Example conversion for a motor move function.
    This function writes to both motors.
    """
    # Convert steps to proper 32-bit representation


    #(multiply PPR x Gear box ratio x OMNIRATIO and total should be divided by 360 and convert them to int) x angle to be given


    LSteps = int(4000*LEFT_MOTOR_GEAR*OMNIRATIO)/360*LAngle
    RSteps = int(4000*RIGHT_MOTOR_GEAR*OMNIRATIO)/360*RAngle
    LSteps = int(LSteps)
    RSteps = int(RSteps)
    print(f"LSteps : {LSteps} , OmniRatio : {OMNIRATIO}, LEFT_GEAR : {LEFT_MOTOR_GEAR}")
    negLSteps = LSteps

    # Prepare 32-bit values (split into two 16-bit registers)
    def split_value(val):
        unsigned_val = (val + (1 << 32)) % (1 << 32)
        return (unsigned_val >> 16, unsigned_val & 0xFFFF)

    Rmsb, Rlsb = split_value(negLSteps)
    Lmsb, Llsb = split_value(RSteps)

    try:
        # Write incremental target positions
        write_register(RIGHT_TURN, 0x6209, Rmsb)
        write_register(LEFT_TURN,  0x6209, Lmsb)
        write_register(RIGHT_TURN, 0x620A, Rlsb)
        write_register(LEFT_TURN,  0x620A, Llsb)
        # Write absolute target positions (if needed)
        write_register(RIGHT_TURN, 0x6201, Rmsb)
        write_register(LEFT_TURN,  0x6201, Lmsb)
        write_register(RIGHT_TURN, 0x6202, Rlsb)
        write_register(LEFT_TURN,  0x6202, Llsb)

        write_register(RIGHT_TURN, INCREMENTAL_VELOCITY, Velocity)
        write_register(LEFT_TURN, INCREMENTAL_VELOCITY, Velocity)
        write_register(RIGHT_TURN, INCREMENTAL_ACCELERATION, acc)
        write_register(LEFT_TURN, INCREMENTAL_ACCELERATION, acc)
        write_register(RIGHT_TURN, INCREMENTAL_DECCELERATION, dcc)
        write_register(LEFT_TURN, INCREMENTAL_DECCELERATION, dcc)

        write_register(RIGHT_TURN, PR_VELOCITY, Velocity)
        write_register(LEFT_TURN, PR_VELOCITY, Velocity)
        write_register(RIGHT_TURN, PR_ACCELERATION, acc)
        write_register(LEFT_TURN, PR_ACCELERATION, acc)
        write_register(RIGHT_TURN, PR_DECELERATION, dcc)
        write_register(LEFT_TURN, PR_DECELERATION, dcc)
        # Write velocity, acceleration, and deceleration
        for reg, value in [(0x620B, Velocity), (0x620C, acc), (0x620D, dcc)]:
            write_register(RIGHT_TURN, reg, value)
            write_register(LEFT_TURN,  reg, value)
        # Trigger motion command based on mode
        if Mode == "INC":
            trigger_val = 0x11
        elif Mode == "ABS":
            trigger_val = 0x10
        else:
            trigger_val = 0x11
        write_register(RIGHT_TURN, 0x6002, trigger_val)
        write_register(LEFT_TURN,  0x6002, trigger_val)

        return True
    except Exception as e:
        print(f"Error in motorMove: {e}")
        return Falser

def enable_drive(device_address):
    """
    Enable the drive before triggering homing.
    The proper enable command must be set according to your drive's documentation.
    For example, writing 0x0088 to the control word register may be required.
    """
    if write_register(device_address, REGISTER_CONTROL_WORD, 0x0088):
        print(f"Drive {device_address} enabled.")
        return True
    else:
        print(f"Failed to enable drive {device_address}.")
        return False


def reboot_driver():
    """
    Reboots the drive by sending the reboot command (0x01) to the control word register (0x1801)
    for each connected motor drive. Returns True if all commands succeed.
    """
    success_right = write_register(RIGHT_MOTOR, REGISTER_CONTROL_WORD, 0x01)
    success_left = write_register(LEFT_MOTOR, REGISTER_CONTROL_WORD, 0x01)

def set_software_zero(device_address):
    """
    Reads the current encoder value and sets it as the zero reference.
    Future position readings should subtract this offset.
    """
    global encoder_offset
    current = readEncoder(device_address)
    if current is None:
        print(f"Failed to read encoder for device {device_address}.")
        return False
    encoder_offset = current
    print(f"Software zero set. Encoder offset for device {device_address}: {encoder_offset}")
    return True

reloadCSV()
readFlag = True

# --------------------------
# Example Usage
# --------------------------
# print(LEFT_MOTOR)


# motorMoveDistance(60,3000,3000,-50,-50,"mm","INC")
# pprR = readPPR(RIGHT_MOTOR)
# print(f"Right Motor PPR: {pprR}")
# pprL = readPPR(LEFT_MOTOR)
# print(f"Right Motor PPR: {pprL}")
setJogVelAcc(RIGHT_MOTOR, JOG_VEL,JOG_ACC) #to set velocity of Right motor to 3000 and acc200
setJogVelAcc(LEFT_MOTOR, JOG_VEL,JOG_ACC) #to set velocity of Right motor to 3000 and acc200
setJogVelAcc(RIGHT_TURN, JOG_VEL,JOG_ACC) #to set velocity of Right motor to 3000 and acc200
setJogVelAcc(LEFT_TURN, JOG_VEL,JOG_ACC) #to set velocity of Right motor to 3000 and acc200


    # Example: Read the PPR from the right motor


    # # Example: Jog the right motor in the clockwise direction
    # if jogMotor(RIGHT_MOTOR, "-"):
    #     print("Right motor jogging clockwise.")
    # else:
    #     print("Jog command failed.")
    # if jogMotor(3, "+"):
    #     print("Right motor jogging clockwise.")
    # else:
    #     print("Jog command failed.")


def readGPIO(device_address, pin_number):
    input_states = read_register(device_address, REGISTER_IO_STATUS)
    if input_states is None:
        return None
    return bool(input_states & (1 << (pin_number - 1)))

def clearAlarm(device_address):
    write_register(device_address, REGISTER_CONTROL_WORD, 0x1111)

def readAlarm(device_address):
    alarmValue = read_register(device_address, 0x2203)
    status = interpret_alarm(alarmValue)
    print(status)
    return status

def pauseMotor(device_address):
    write_register(device_address, PR_TRIG, 0x040)
def pauseAll():
    write_register(RIGHT_MOTOR, PR_TRIG, 0x040)
    write_register(RIGHT_TURN, PR_TRIG, 0x040)
    write_register(LEFT_MOTOR, PR_TRIG, 0x040)
    write_register(LEFT_TURN, PR_TRIG, 0x040)

def interpret_alarm(alarm_value):
    if alarm_value == 0:
        return "No alarms."

    alarms = []
    troubleshooting = []

    # Define alarm codes and their troubleshooting steps
    alarm_codes = {
        0x01: ("Over-current", [
            "1. Restart the drive",
            "2. If it still exists, check whether the motor is short-circuited or not connected to the motor"
        ]),
        0x02: ("Over-voltage", [
            "1. Restart the drive",
            "2. If it still exists, check the voltage of power supply"
        ]),
        0x40: ("Current sampling circuit error", [
            "1. Restart the drive",
            "2. If it still exists, the hardware failure"
        ]),
        0x80: ("Shaft locking error", [
            "1. Check whether the motor wire is broken"
        ]),
        0x200: ("EEPROM error", [
            "Harware Failure"
        ]),
        0x100: ("Auto tuning error", [
            "1. Restart the drive",
            "2. If it still exists, or Contact Ignomagine Team"
        ]),
        0x20: ("Position following error", [
            "1. Check if the value of encoder resolution or Contact Ignomagine Team",
            "2. Check if the encoder cable is broken",
            "3. Check if the limit switch is damaged",
            "4. Check if the acceleration time is too small, or the starting speed is too large"
        ]),
        0x08: ("Encoder cable error", [
            "1. Check if the encoder cable is damaged",
            "2. Whether no encoder extension cable is used"
        ])
    }

    # Check each alarm code bit
    for code, (desc, steps) in alarm_codes.items():
        if alarm_value & code:
            alarms.append(desc)
            troubleshooting.extend(steps)

    if not alarms:
        return "Unknown alarm code."

    # Format the response
    response = "Active Alarms: " + ", ".join(alarms)
    if troubleshooting:
        response += "\nTroubleshooting Steps:\n" + "\n".join(troubleshooting)

    return response





# while (Rgpio7 == True) and (Lgpiqo7 == True):
#     Rgpio7 = readGPIO(RIGHT_TURN, 7)
#     Rgpio6 = readGPIO(RIGHT_TURN, 6)
#     Lgpio7 = readGPIO(LEFT_TURN, 7)
#     Lgpio6 = readGPIO(LEFT_TURN, 6)
#     jogMotor(RIGHT_TURN, "-")
#     jogMotor(LEFT_TURN, "-")
#     print(f"Rgpio7 :{Rgpio7}")
#     print(f"Lgpio7 :{Lgpio7}")
# set_soft_limits(RIGHT_TURN, -20000, 20000)
# disable_soft_limits(RIGHT_TURN)
turnHoming = True

while True:
   pass
close_client()
time.sleep(1)