#!/usr/bin/env python3
"""
Refactored Servo Motor Control Program for the EL7-RS Series
---------------------------------------------------------------
This program uses the minimalmodbus library to control servo motors via the Modbus RTU interface.
The register addresses below are defined based on the EL7-RS Series datasheet holding registers.
For example, registers for pulse per revolution, encoder feedback, PR mode motion control, and
others (e.g., holding torque, control word) are all defined per the datasheet.
Refer to the datasheet (e.g. :contentReference[oaicite:1]{index=1}) for complete details.

Dependencies:
    - minimalmodbus
    - math, time
    - myCSV (for CSV update functions; adjust as needed)
"""

import minimalmodbus
import math
import time
from myCSV import *  # Assumes you have a myCSV module for logging positions

# --- Register Definitions (Holding Registers as per datasheet) ---

# General Motor Parameters
REG_PULSE_PER_REV      = 0x0017    # Pulse per revolution
REG_ENCODER_LOW        = 0x0B1C    # Lower word of encoder feedback 0x0B1D
REG_ENCODER_HIGH       = 0x0B1D    # Higher word of encoder feedback 0x0B1C
REG_CONTROL_MODE       = 0x0003
REG_CONTROL_WORD        =0x0033
REG_CURRENT_ALARM      = 0x0B02
REG_MOTION_STATUS      = 0x0B05
REG_JOG_VELOCITY       = 0x0609
REG_JOG_ACCELERATION   = 0x0633

REG_BAUD_RATE          =0x053D
REG_SLAVE_ID           =0x053F
REG_EMERGENCY_STOP     =0X0457
REG_MOTOR_CURRENT      =0x0B08
REG_DRIVER_TEMPERATURE =0x0B0B
REG_POS_LIM            =0x0401
REG_NEG_LIM            =0X0403
REG_ALARM_STATUS       =0x041B


# Absolute PR Mode Registers
PR_VELOCITY        = 0x6203
PR_ACCELERATION    = 0x6204
PR_DECELERATION    = 0x6205
PR_HIGHBIT         = 0x6201 #1
PR_LOWBIT          = 0x6202 #2
PR_TRIGGER         = 0x6002    # Write 0x10 for ABS mode trigger

MOTION_MODE         =0x6200     #WRITE 0X001 FOR ABS, 0X0041 FOR INC, 0X002 FOR VELOCITY
REG_POT             =0x0401     #POSITIVE LIMIT REGISTER
REG_NOT             =0x0403     #NEGATIVE LIMIT REGISTER
# --- ServoController Class ---

class ServoController:
    def __init__(self, serial_port, baudrate, motor_addresses):
        """
        motor_addresses: dictionary with keys 'right', 'left', 'lift', 'drag'
        """
        self.serial_port = serial_port
        self.baudrate = baudrate
        # Create minimalmodbus.Instrument objects for each motor
        self.motors = {}
        for key, addr in motor_addresses.items():
            inst = minimalmodbus.Instrument(serial_port, addr)
            inst.serial.baudrate = baudrate
            self.motors[key] = inst

    # --- Basic Modbus Read/Write Methods ---



    def read_register(self, motor_key, reg_addr, functioncode=3):
        try:
            value = self.motors[motor_key].read_register(reg_addr, functioncode=functioncode)
            return value
        except Exception as e:
            print(f"[{motor_key}] Error reading register 0x{reg_addr:04X}: {e}")
            return None

    def write_register(self, motor_key, reg_addr, value, functioncode=6):
        try:
            self.motors[motor_key].write_register(reg_addr, value, functioncode=functioncode)
            # Optionally: print(f"[{motor_key}] Wrote {value} to register 0x{reg_addr:04X}")
            return True
        except Exception as e:
            print(f"[{motor_key}] Error writing to register 0x{reg_addr:04X}: {e}")
            return False

    # --- High-Level Control Methods ---
    def reset_alarm(self, motor_key):
        # Writing a specific control word resets alarm (value 0x1111 as per datasheet example)
        self.write_register(motor_key, REG_CONTROL_WORD, 0x1111)

    def reset_history_alarm(self, motor_key):
        self.write_register(motor_key, REG_CONTROL_WORD, 0x1122)

    def set_pulse_per_revolution(self, motor_key, ppr):
        self.write_register(motor_key, REG_PULSE_PER_REV, ppr)

    def reset_encoder(self, motor_key):
       self.write_register(motor_key, 0x6002, 0x0020)  # Trigger homing

    def read_encoder(self, motor_key):
        lsb = self.read_register(motor_key, REG_ENCODER_LOW)
        msb = self.read_register(motor_key, REG_ENCODER_HIGH)
        if lsb is None or msb is None:
            return None
        # Combine to form a 32-bit signed integer
        val = (lsb << 16) | msb
        if val & (1 << 31):
            val -= (1 << 32)
        return val

    def jog(self, motor_key, direction):
        """
        Jog the motor in the specified direction.
        direction: "+" for one direction, "-" for the opposite.
        """
        self.write_register(motor_key, 0x0003, 1)
        # The control word values 0x4001 and 0x4002 trigger jog commands.
        if direction == "+":
            return self.write_register(motor_key, 0x0033, 0x4002)
        elif direction == "-":
            return self.write_register(motor_key, 0x0033, 0x4001)
        else:
            print("Invalid jog direction. Use '+' or '-'.")
            return False



    # --- PR Mode Motion Methods ---
    def move_absolute(self, motor_key, velocity, acceleration, deceleration, target_steps):
        """
        Moves the motor in absolute PR mode.
        target_steps: a signed 32-bit integer (can be positive or negative).
        """
        # Convert target_steps into two 16-bit values
        steps = target_steps & 0xFFFFFFFF
        msb = (steps >> 16) & 0xFFFF
        lsb = steps & 0xFFFF
        #self.write_register(motor_key, 0x0003, 6)
        self.write_register(motor_key, MOTION_MODE, 0x0001)
        self.write_register(motor_key, PR_HIGHBIT, msb)
        self.write_register(motor_key, PR_LOWBIT, lsb)
        self.write_register(motor_key, PR_VELOCITY, velocity)
        self.write_register(motor_key, PR_ACCELERATION, acceleration)
        self.write_register(motor_key, PR_DECELERATION, deceleration)
        # Trigger move (0x10 for ABS mode as per datasheet)
        self.write_register(motor_key, PR_TRIGGER, 0x10)

    def jog_forward(self, motor_key, velocity, acceleration, deceleration):
        """
        Moves the motor in incremental PR mode.
        step_increment: a signed 32-bit value representing the steps to move.
        """
        step_increment = 2000
        steps = step_increment & 0xFFFFFFFF
        msb = (steps >> 16) & 0xFFFF
        lsb = steps & 0xFFFF
        #self.write_register(motor_key, 0x0003, 6)
        self.write_register(motor_key, MOTION_MODE, 0x0041)
        self.write_register(motor_key, PR_HIGHBIT, msb)
        self.write_register(motor_key, PR_LOWBIT, lsb)
        self.write_register(motor_key, PR_VELOCITY, velocity)
        self.write_register(motor_key, PR_ACCELERATION, acceleration)
        self.write_register(motor_key, PR_DECELERATION, deceleration)
        # Trigger move (0x11 for incremental mode)
        self.write_register(motor_key, PR_TRIGGER, 0x10)

    def jog_reverse(self, motor_key, velocity, acceleration, deceleration):
        """
        Moves the motor in incremental PR mode.
        step_increment: a signed 32-bit value representing the steps to move.
        """
        step_increment=-500
        steps = step_increment & 0xFFFFFFFF
        msb = (steps >> 16) & 0xFFFF
        lsb = steps & 0xFFFF
       # self.write_register(motor_key, 0x0003, 6)
        self.write_register(motor_key, MOTION_MODE, 0x0041)
        self.write_register(motor_key, PR_HIGHBIT, msb)
        self.write_register(motor_key, PR_LOWBIT, lsb)
        self.write_register(motor_key, PR_VELOCITY, velocity)
        self.write_register(motor_key, PR_ACCELERATION, acceleration)
        self.write_register(motor_key, PR_DECELERATION, deceleration)
        # Trigger move (0x11 for incremental mode)
        self.write_register(motor_key, PR_TRIGGER, 0x10)

    def move_incremental(self, motor_key, velocity, acceleration, deceleration, step_increment):
        """
        Moves the motor in incremental PR mode.
        step_increment: a signed 32-bit value representing the steps to move.
        def split_value(val):
        unsigned_val = (val + (1 << 32)) % (1 << 32)
        return (unsigned_val >> 16, unsigned_val & 0xFFFF)
        """
        steps = step_increment & 0xFFFFFFFF
        msb = (steps >> 16) & 0xFFFF
        lsb = steps & 0xFFFF
        # self.write_register(motor_key, 0x0003, 6)
        self.write_register(motor_key, MOTION_MODE, 0x0041)
        self.write_register(motor_key, PR_HIGHBIT, msb)
        self.write_register(motor_key, PR_LOWBIT, lsb)
        self.write_register(motor_key, PR_VELOCITY, velocity)
        self.write_register(motor_key, PR_ACCELERATION, acceleration)
        self.write_register(motor_key, PR_DECELERATION, deceleration)
        # Trigger move (0x11 for incremental mode)
        self.write_register(motor_key, PR_TRIGGER, 0x10)

    def move_velocity_test(self, motor_key, velocity, acceleration, deceleration, dtime, direction):
        """
        Moves the motor with specified velocity in either direction.
        velocity: absolute value for speed (always positive)
        direction: 0 for forward/clockwise, 1 for reverse/counterclockwise
        acceleration: rate of speed increase
        deceleration: rate of speed decrease
        dtime: duration of movement
        """
        # Ensure velocity is positive
        velocity = abs(velocity)

        # Set PR0 as velocity mode
        self.write_register(motor_key, 0x6200, 0x0002)

        # Set direction - this register may need to be changed based on your specific controller
        self.write_register(motor_key, 0x6201, direction)  # 0 for forward, 1 for reverse

        # Set velocity (positive value)
        self.write_register(motor_key, 0x6203, velocity)

        # Set acceleration and deceleration
        self.write_register(motor_key, 0x6204, acceleration)
        self.write_register(motor_key, 0x6205, deceleration)

        # Trigger PR0 motion
        self.write_register(motor_key, 0x6002, 0x0010)

        # Wait for specified time
        time.sleep(dtime)

        # Stop motion
        self.write_register(motor_key, 0x6002, 0x0040)

    def move_velocity(self, motor_key, velocity, acceleration, deceleration, dtime):
        """
        Moves the motor in absolute PR mode.
        target_steps: a signed 32-bit integer (can be positive or negative).
        """
        # self.write_register(motor_key, 0x0003, 6)
        self.write_register("right", 0x6200, 0x0002)  # Set PR0 as velocity mode
        self.write_register("right", 0x6203, velocity)  # Velocity
        self.write_register("right", 0x6204, acceleration)  # Acceleration
        self.write_register("right", 0x6205, deceleration)  # Deceleration
        self.write_register("right", 0x6002, 0x0010)  # Trigger PR0 motion
        time.sleep(dtime)
        self.write_register("right", 0x6002, 0x0040)

        # self.write_register(motor_key, MOTION_MODE, 0x0002)
        # self.write_register(motor_key, PR_VELOCITY, velocity)
        # self.write_register(motor_key, PR_ACCELERATION, acceleration)
        # self.write_register(motor_key, PR_DECELERATION, deceleration)
        # # Trigger move (0x10 for ABS mode as per datasheet)
        # self.write_register(motor_key, PR_TRIGGER, 0x10)

    # --- Example Coordinated Move ---
    def move_distance(self, velocity, acceleration, deceleration, left_distance, right_distance, unit, mode="INC", store_positions=False):
        """
        Converts given distances to steps and moves left and right motors accordingly.
        Assumes a function wheel_circumference() and conversion factors (gear ratios) are defined.
        """
        # Example conversion functions:
        def wheel_circumference(diameter):
            return math.pi * diameter

        def distance_to_steps(distance, diameter, ppr, gear_ratio):
            # Convert distance (in the specified unit, assumed here to be in mm) to steps.
            circumference = wheel_circumference(diameter)
            revolutions = distance / circumference
            return int(revolutions * ppr * gear_ratio)

        # Example parameters (set these based on your hardware):
        WHEEL_DIA = 100.0        # in mm, adjust as needed
        RIGHT_GEAR = 1.0
        LEFT_GEAR = 1.0

        # Read pulse per revolution from one motor (assuming both are same)
        ppr = self.read_register("right", REG_PULSE_PER_REV)
        if ppr is None:
            print("Error: Could not read pulse per revolution.")
            return False

        left_steps = distance_to_steps(left_distance, WHEEL_DIA, ppr, LEFT_GEAR)
        right_steps = distance_to_steps(right_distance, WHEEL_DIA, ppr, RIGHT_GEAR)

        # For coordinated move, here we use incremental mode for both motors.
        if mode.upper() == "INC":
            self.move_incremental("right", velocity, acceleration, deceleration, -left_steps)
            self.move_incremental("left", velocity, acceleration, deceleration, right_steps)
        elif mode.upper() == "ABS":
            self.move_absolute("right", velocity, acceleration, deceleration, -left_steps)
            self.move_absolute("left", velocity, acceleration, deceleration, right_steps)
        else:
            print("Invalid mode specified. Use 'INC' or 'ABS'.")
            return False

        if store_positions:
            update_csv("LTarPos", abs(right_steps), "positions.csv")
            update_csv("RTarPos", abs(left_steps), "positions.csv")
            update_csv("CurMode", mode.upper(), "positions.csv")
        return True

    # --- Additional Methods ---
    def check_motion_completion(self, motor_key, status_bit=5):
        """
        Checks the motion status register for the completion flag.
        Returns True if the bit is set.
        """
        status = self.read_register(motor_key, REG_MOTION_STATUS)
        if status is None:
            return False
        return bool(status & (1 << status_bit))

    def check_pot(self, motor_key):

        val1 = self.read_register(motor_key, 0x0B11)
        plim = val1 & 0x0001
        return int (plim)

    def check_pr(self, motor_key):

        pr = self.read_register(motor_key, 0x0B12)
        prval = pr & 0x0002
        return int (prval)

    def check_not(self, motor_key):

        val2 = self.read_register(motor_key, 0x0B11)
        nlim = val2 & 0x0002
        return int (nlim)

# --- Example Usage ---

if __name__ == "__main__":
    # # Define your serial port and motor device addresses (as per your configuration)
    SERIAL_PORT = SERIAL_PORT
    BAUDRATE = BAUDRATE
    MOTOR_ADDRESSES = {
        "right": 1,
        "left": 2,
        "lift": 3,
        "drag": 4
    }

    controller = ServoController(SERIAL_PORT, BAUDRATE, MOTOR_ADDRESSES)
    #
    # # Set pulse per revolution for right and left motors (example: 4000)
    # controller.set_pulse_per_revolution("right", 10000)
    # controller.set_pulse_per_revolution("left", 10000)
    #
    # # Reset alarms for all motors
    # for key in MOTOR_ADDRESSES.keys():
    #     controller.reset_alarm(key)
    #
    # # Example: Jog right motor in positive direction
    # controller.jog("right", "+")
    #
    # # Example: Move a distance (in mm) using incremental PR mode
    # # Move left motor forward 500 mm and right motor backward 500 mm
    # success = controller.move_distance(velocity=1000, acceleration=500, deceleration=500,
    #                                    left_distance=500, right_distance=500,
    #                                    unit="mm", mode="INC", store_positions=True)
    # if success:
    #     print("Distance move command issued successfully.")
    #
    # # Example: Read and print encoder values
    # right_enc = controller.read_encoder("right")
    # left_enc  = controller.read_encoder("left")
    # print(f"Right Encoder: {right_enc}, Left Encoder: {left_enc}")

    # Additional functions (homing, reboot, etc.) can be called similarly.
