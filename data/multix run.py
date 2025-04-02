from pycparser.c_ast import Break

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


def wait_for_pr_completion(motor_key, timeout=30):
    """
    Wait until the Positioning Run (PR) has completed or timeout occurs.

    Parameters:
    motor_key (str): The key of the motor to check
    timeout (int): Maximum time to wait in seconds

    Returns:
    bool: True if PR completed, False if timed out
    """
    start_time = time.time()
    while (time.time() - start_time) < timeout:
        # Check PR completion status
        pr_status = controller.check_pr(motor_key)

        if pr_status == 2:  # PR is completed
            print(f"PR complete. Position: {controller.read_encoder(motor_key)}")
            return True

        # Short sleep to prevent CPU overload
        time.sleep(0.1)

    print(f"PR completion timed out after {timeout} seconds!")
    return False


def sett():
    controller.reset_encoder("right")
    while True:

        # en1=controller.read_encoder("right")
        controller.move_incremental("right", 400, 400, 200, 100000)
        time.sleep(1)
        val1 = controller.read_register("right", 0x0B11)
        data1 = val1 & 0x0001

        if data1 == 0:
            controller.reset_encoder("right")
            time.sleep(2)
            en1 = controller.read_encoder("right")
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
                if data2 == 0:
                    en2 = controller.read_encoder("right")
                    print(en1, en2)
                    update_csv("START_POS", en1, "multix_data.csv")
                    update_csv("END_POS", en2, "multix_data.csv")
                    break

            break


def main():
    controller.reset_alarm(MOTOR_KEY)
    controller.reset_history_alarm(MOTOR_KEY)
    controller.reset_encoder(MOTOR_KEY)
    controller.reset_encoder(MOTOR_KEY)
    controller.reset_encoder(MOTOR_KEY)
    print("encoder reset to 0")

    print(controller.read_encoder("right"))
    time.sleep(2)
    completion_count = CC_COMPLETE
    try:
        while True:
            # Reload CSV settings to get current values
            reloadCSV()
            status = read_setting('R_STATUS', 'multix_data.csv')
            print(status)
            c_complete = CC_COMPLETE
            c2complete = C2COMPLETE
            speed1 = int(SPEED)
            pos1 = int(START_POS)
            pos2 = int(END_POS)

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
                controller.move_incremental("right", speed1, DEFAULT_ACCEL, DEFAULT_DECEL, -1*(end_pos))
                print(controller.read_encoder("right"))

                # Wait for PR to complete before proceeding
                if not wait_for_pr_completion(MOTOR_KEY):
                    print("PR did not complete for forward motion. Stopping cycle.")
                    continue
                controller.read_encoder("right")
                print("Reached end position. Waiting 1 second...")
                time.sleep(1)  # Wait a moment at the end position

                print(f"Moving back to start position: {start_pos}")
                # Move back to start position
                controller.move_incremental("right", speed1, DEFAULT_ACCEL, DEFAULT_DECEL, -1000000)

                # Wait for PR to complete before proceeding
                if not wait_for_pr_completion(MOTOR_KEY):
                    print("PR did not complete for reverse motion. Stopping cycle.")
                    continue
                controller.read_encoder("right")
                print(controller.read_encoder("right"))
                print("Reached start position. Cycle completed.")

                # Increment completion count and update CSV
                completion_count += 1
                update_csv("CC_COMPLETE", str(completion_count), "multix_data.csv")

                print(f"Completed cycles: {completion_count}/{c2complete}")
                if completion_count >= c2complete:
                    print(f"Completed required {c2complete} cycles. Stopping.")
                    update_csv("R_STATUS", "stop", "multix_data.csv")
                    break

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
    sett()
    time.sleep(2)

    main()