from driver import ServoController
from driver import *
import time
from myCSV import *
# Define your configuration parameters
SERIAL_PORT ="COM17"    # Update with your actual serial port
BAUDRATE =38400             # Update as needed
MOTOR_ADDRESSES = {
    "right": 1,
    "left": 2,
    "lift": 3,
    "drag": 4
}

# Create an instance of ServoController
controller = ServoController(SERIAL_PORT, BAUDRATE, MOTOR_ADDRESSES)
#controller.write_register("right", 0x0409,0x0053)
controller.write_register("right", 0x0003,1)
#controller.write_register("right", 0x002D,1)
controller.write_register("right", 0x0301,1)
controller.write_register("right", 0x0309,0x01F4)
controller.write_register("right", 0x030B,0x01F4)
controller.write_register("right", 0x030D,0x01F4)
controller.write_register("right", 0x030F,0x01F4)
# Use the controller to read from a register (e.g., REG_PULSE_PER_REV at 0x0001) on the "right" motor
while True:
#     controller.write_register("right", 0x0309, 0x01F4)
    value1 = controller.read_register("right", 0x0309 )
    value2 = controller.read_register("right", 0x030B )
    value3 = controller.read_register("right", 0x030D )
    value4 = controller.read_register("right", 0x030F )
    print(value1, value2, value3, value4)
#     controller.write_register("right", 0x0033,0x4002)
#
#    controller.write_register("right", 0x0409,0x0053)

# #     #time.sleep(1)  # Delay to avoid flooding the bus
