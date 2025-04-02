from driver import *
import time
from myCSV import *

DEFAULT_ACCEL = 200
DEFAULT_DECEL = 200
start_pos = int(START_POS)  # Convert to int for motor control
end_pos = int(END_POS)  # Convert to int for motor control
speed = int(SPEED)  # Convert to int for motor control


MOTOR_ADDRESSES = {
    "right": RIGHT_MOTOR,
    "left": LEFT_MOTOR,
    "lift": LIFT_MOTOR,
    "drag": DRAG_MOTOR
}

MOTOR_KEY = "right"  # Default to right motor
controller = ServoController(SERIAL_PORT, BAUDRATE, MOTOR_ADDRESSES)

# Initialize PR mode
controller.write_register(MOTOR_KEY, 0x6000, 0x0)
def main():

    controller.reset_alarm(MOTOR_KEY)
    controller.reset_history_alarm(MOTOR_KEY)
    controller.reset_encoder(MOTOR_KEY)
    completion_count=CC_COMPLETE
    try:
        while True:
            # Reload CSV settings to get current values
            reloadCSV()
            status =read_setting('R_STATUS', 'multix_data.csv')
            print(status)
            c_complete = CC_COMPLETE
            c2complete = C2COMPLETE
            speed1=int(SPEED)
            pos1=int(START_POS)
            pos2=int(END_POS)


            # Print current status for debugging
            print(f"Status: {status}, Completion: {c_complete}/{c2complete}")

            # Process based on status
            if status.lower() == "stop":
                print("Stop command received. Waiting for 'running' status...")
                time.sleep(0.5)

            elif status.lower() == "pause":
                print("Paused. Waiting to resume...")
                time.sleep(0.2)

            elif status.lower() == "running":
                # Check if we've completed the required cycles
                if c_complete >= c2complete:
                    print(f"Completed required {c2complete} cycles. Stopping.")
                    update_csv("R_STATUS", "stop", "multix_data.csv")
                    break

                print(f"Moving to end position: {end_pos}")
                # Move to end position
                # controller.move_absolute("right", speed1, DEFAULT_ACCEL, DEFAULT_DECEL, pos2)
                # print(speed1,DEFAULT_ACCEL,DEFAULT_DECEL,pos2)
                controller.move_incremental("right", 200, 200, 200, 100000000)
                print(controller.read_register("right", 0x6201))
                print(controller.read_register("right", 0x6202))
                print("Reached end position. Waiting 1 second...")
                time.sleep(1)  # Wait a moment at the end position

                print(f"Moving back to start position: {start_pos}")
                # Move back to start position
                # controller.move_absolute("right", speed1, DEFAULT_ACCEL, DEFAULT_DECEL, pos1)
                controller.move_incremental("right", 200, 200, 200, -100000000)

                print("Reached start position. Cycle completed.")

                # Increment completion count and update CSV
                completion_count += 1
                update_csv("CC_COMPLETE", str(completion_count), "multix_data.csv")

                print(f"Completed cycles: {completion_count}/{c2complete}")
                if completion_count >= c2complete:
                    print(f"Completed required {c2complete} cycles. Stopping.")
                    update_csv("R_STATUS", "stop", "multix_data.csv")
                    break

                # Small pause between cycles
                time.sleep(1)

            else:
                print(f"Unknown status: {status}. Waiting for valid status...")
                time.sleep(0.5)

    except KeyboardInterrupt:
        print("\nProgram interrupted by user. Stopping motors and exiting...")
    except Exception as e:
        print(f"Error in main loop: {e}")
    finally:
        # Ensure motors are stopped
        try:
            # Send a stop command
            controller.write_register(MOTOR_KEY, PR_VELOCITY, 0)
            controller.write_register(MOTOR_KEY, 0x6002, 0x0040)
        except:
            pass

        print("Program terminated.")


if __name__ == "__main__":
    main()