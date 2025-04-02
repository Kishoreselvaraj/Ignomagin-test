from driver import *
import time
from myCSV import *
# Define your configuration parameters
SERIAL_PORT =SERIAL_PORT    # Update with your actual serial port
BAUDRATE =38400             # Update as needed
MOTOR_ADDRESSES = {
    "right": 1,
    "left": 2,
    "lift": 3,
    "drag": 4
}
controller = ServoController(SERIAL_PORT, BAUDRATE, MOTOR_ADDRESSES)
# controller.write_register("right", 0x0003,0)    #setting in pr mode
# controller.write_register("right", 0x6000,0x0)
while True:
    a=controller.read_register(1,0x0003)
    print(a)