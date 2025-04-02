
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
# controller.write_register("right", 0x0003,0)    #setting in pr mode
# controller.write_register("right", 0x6000,0x0)

if __name__ == "__main__":
 controller.reset_encoder("right")
 while True:

    # en1=controller.read_encoder("right")
    controller.move_incremental("right", 400, 400, 200, 100000)
    time.sleep(1)
    val1 = controller.read_register("right", 0x0B11)
    data1 = val1 & 0x0001

    if data1==0:
        controller.reset_encoder("right")
        time.sleep(2)
        en1=controller.read_encoder("right")
        print(en1)
        time.sleep(2)

        while True:
            # print("inside another while true")
            controller.move_incremental("right", 400, 400, 200, -100000)
            time.sleep(1)
            val2 = controller.read_register("right", 0x0B11)
            data2 = val2 & 0x0002
            en3 = controller.read_encoder("right")
            print(en3)
            if data2==0:
                en2 = controller.read_encoder("right")
                print(en1,en2)
                break

        break





