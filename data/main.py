
from driver import ServoController
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
# controller.write_register("right", 0x0003,0x0006)    #setting in pr mode
controller.write_register("right", 0x6000,0x0)

if __name__ == "__main__":
    # set_relative_position()
    # time.sleep(2)
    # set_velocity_mode()
    # time.sleep(2)
    # set_absolute_position()
    #def move_incremental(self, motor_key, velocity, acceleration, deceleration, step_increment):
    #controller.move_absolute("right", 200, 200, 200, 50000)
    #controller.move_incremental("right", 200, 200, 200, -100000)

    # en2=controller.read_encoder("right")
    # print(en2)
    # time.sleep(2)
    #controller.move_velocity(600,500,500,500,5)
    # controller.reset_encoder("right")
    # en2=controller.read_encoder("right")
    # print(en2)
    while True:
    #     #controller.jog("right", "+")
    #    # controller.write_register("right", 0x0033, 0x4001)
    #     val1=controller.read_register("right",0x0033)
         val2 = controller.read_register("right", 0x0003)
         print(val2)

        #controller.jog_reverse("right",500,500,500)
