#!/usr/bin/env python3
"""
Standalone Keyboard Control for Servo Motors
-------------------------------------------
This script directly controls servo motors using keyboard inputs without a GUI window.
Just run this script and use the keyboard to control the servos:

Controls:
  - Arrow Up: Jog forward
  - Arrow Down: Jog reverse
  - W: Absolute move (positive)
  - S: Absolute move (negative)
  - A: Incremental move (positive)
  - D: Incremental move (negative)
  - V: Velocity mode
  - C: Clear alarm
  - E: Reset encoder
  - Esc: Exit program
"""

import time
import keyboard
import sys
import tkinter as tk
from tkinter import simpledialog
from driver import *
from myCSV import *
# Define your configuration
SERIAL_PORT = SERIAL_PORT  # Update with your actual serial port
BAUDRATE = BAUDRATE  # Update as needed
MOTOR_ADDRESSES = {
    "right": 1,
    "left": 2,
    "lift": 3,
    "drag": 4
}

# Default movement parameters
VELOCITY = 1000
ACCELERATION = 500
DECELERATION = 500

# Create instance of the controller
print(f"Initializing controller on {SERIAL_PORT} at {BAUDRATE} baud...")
controller = ServoController(SERIAL_PORT, BAUDRATE, MOTOR_ADDRESSES)
# Set the motor to PR mode
controller.write_register("right", 0x0003, 6)  # Setting in PR mode
controller.write_register("right", 0x6000, 0x0)
print("Controller initialized successfully!")

# Function to get numeric input from user
def get_numeric_input(title, prompt):
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    value = simpledialog.askstring(title, prompt, parent=root)
    root.destroy()

    if value:  # If input is not empty or None
        # Filter out non-numeric characters and allow decimal point and minus sign
        filtered_value = ''.join(c for c in value if c.isdigit() or c == '.' or c == '-')
        try:
            # Try to convert the filtered string to a float
            return float(filtered_value)
        except ValueError:
            return None  # Return None if conversion fails
    return None


# Print status information
def print_status():
    try:
        encoder_value = controller.read_encoder("right")
        print(f"Right motor encoder: {encoder_value}")
    except Exception as e:
        print(f"Error reading encoder: {e}")


# Motor control functions
def jog_forward():
    print("Jogging forward...")
    try:
        controller.jog_forward("right", 1000, 100, 100)
    except Exception as e:
        print(f"Error: {e}")


def jog_reverse():
    print("Jogging reverse...")
    try:
        controller.jog_reverse("right", 1000, 100, 100)
    except Exception as e:
        print(f"Error: {e}")


def abs_positive_move():
    steps = get_numeric_input("Absolute Move (Positive)", "Enter number of steps:")
    if steps is not None:
        print(f"Moving to absolute position {steps}...")
        try:
            controller.move_absolute("right", VELOCITY, ACCELERATION, DECELERATION, int(steps))
        except Exception as e:
            print(f"Error: {e}")


def abs_negative_move():
    steps = get_numeric_input("Absolute Move (Negative)", "Enter number of steps:")
    if steps is not None:
        steps = -abs(steps)  # Ensure it's negative
        print(f"Moving to absolute position {steps}...")
        try:
            controller.move_absolute("right", VELOCITY, ACCELERATION, DECELERATION, int(steps))
        except Exception as e:
            print(f"Error: {e}")


def inc_positive_move():
    steps = get_numeric_input("Incremental Move (Positive)", "Enter number of steps:")
    if steps is not None:
        print(f"Moving incrementally by {steps} steps...")
        try:
            controller.move_incremental("right", VELOCITY, ACCELERATION, DECELERATION, int(steps))
        except Exception as e:
            print(f"Error: {e}")


def inc_negative_move():
    steps = get_numeric_input("Incremental Move (Negative)", "Enter number of steps:")
    if steps is not None:
        steps = -abs(steps)  # Ensure it's negative
        print(f"Moving incrementally by {steps} steps...")
        try:
            controller.move_incremental("right", VELOCITY, ACCELERATION, DECELERATION, int(steps))
        except Exception as e:
            print(f"Error: {e}")


def velocity_mode():
    duration = get_numeric_input("Velocity Mode", "Enter time duration (seconds):")
    if duration is not None:
        print(f"Running in velocity mode for {duration} seconds...")
        try:
            controller.move_velocity("right", VELOCITY, ACCELERATION, DECELERATION, duration)
        except Exception as e:
            print(f"Error: {e}")


def clear_alarm():
    print("Clearing alarms...")
    try:
        for motor in MOTOR_ADDRESSES.keys():
            controller.reset_alarm(motor)
        print("Alarms cleared for all motors")
    except Exception as e:
        print(f"Error: {e}")


def reset_encoder():
    print("Resetting encoder...")
    try:
        controller.reset_encoder("right")
        print("Encoder reset complete")
    except Exception as e:
        print(f"Error: {e}")


def stop_motors():
    print("Stopping all motors...")
    try:
        for motor in MOTOR_ADDRESSES.keys():
            controller.write_register(motor, 0x6002, 0x0040)  # Stop command
    except Exception as e:
        print(f"Error stopping motors: {e}")


def exit_program():
    print("Exiting program...")
    stop_motors()
    keyboard.unhook_all()
    sys.exit(0)


# Register keyboard hooks
print("\nKeyboard control active. Use the following keys:")
print("  Up Arrow: Jog Forward")
print("  Down Arrow: Jog Reverse")
print("  W: Absolute Move (Positive)")
print("  S: Absolute Move (Negative)")
print("  A: Incremental Move (Positive)")
print("  D: Incremental Move (Negative)")
print("  V: Velocity Mode")
print("  C: Clear Alarm")
print("  E: Reset Encoder")
print("  Esc: Exit Program\n")

# Register key handlers
keyboard.add_hotkey('up', jog_forward)
keyboard.add_hotkey('down', jog_reverse)
keyboard.add_hotkey('w', abs_positive_move)
keyboard.add_hotkey('s', abs_negative_move)
keyboard.add_hotkey('a', inc_positive_move)
keyboard.add_hotkey('d', inc_negative_move)
keyboard.add_hotkey('v', velocity_mode)
keyboard.add_hotkey('c', clear_alarm)
keyboard.add_hotkey('e', reset_encoder)
keyboard.add_hotkey('esc', exit_program)

# Main loop to keep script running and periodically show status
try:
    while True:
        print_status()
        time.sleep(2)  # Update status every 2 seconds
except KeyboardInterrupt:
    # Handle Ctrl+C
    print("\nProgram interrupted by user")
    exit_program()