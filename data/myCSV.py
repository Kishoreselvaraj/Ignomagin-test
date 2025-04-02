import csv

def read_setting(setting_name, csv_file):
    try:
        with open(csv_file, 'r', newline='') as file:
            reader = csv.DictReader(file)
            for row in reader:
                if row['Setting'] == setting_name :
                    return row['Value']
    except FileNotFoundError:
        print(f"File {csv_file} not found.")
    except Exception as e:
        print(f"Error reading setting '{setting_name}': {e}")
    return None

def readByIndex(csv_file, index):
    try:
        with open(csv_file, 'r', newline='') as file:
            reader = csv.reader(file)
            # Skip the header
            next(reader, None)
            for idx, row in enumerate(reader):
                if idx == index:
                    try:
                        # Assuming `mag`, `dir`, `unit` are at specific column indices
                        mag = row[1]
                        dir = row[2]
                        unit = row[3]
                        mid = row[4]
                        vel = row[5]
                        lmn = row[6]
                        lmx = row[7]
                        ldt = row[8]
                        return mag, dir, unit, mid, vel, lmn, lmx, ldt
                    except IndexError as e:
                        print(f"Error reading row at index {index}: {e}")
                        return None, None, None, None, None, None, None, None
    except FileNotFoundError as e:
        print(f"File not found: {e}")
    except Exception as e:
        print(f"An error occurred while reading the CSV file: {e}")
    return None, None, None, None, None, None, None, None

def lastIndex(csv_file):
    try:
        with open(csv_file, 'r', newline='') as file:
            reader = csv.reader(file)
            next(reader, None)  # Skip the header
            row_count = sum(1 for row in reader)  # Summing the total number of rows
        return row_count   # Return the last index (0-based)
    except Exception as e:
        print(f"An error occurred while counting rows: {e}")
        return None

def checkSeq(csv_file):
    try:
        with open(csv_file, 'r', newline='') as file:
            reader = csv.DictReader(file)
            expected_id = 1  # Start counting from 1
            for row in reader:
                if int(row['id']) != expected_id:
                    return False
                expected_id += 1  # Increment expected ID for the next row
        return True  # If all IDs were as expected, return True
    except Exception as e:
        print(f"Error checking sequence: {e}")
        return False

def update_csv(setting, new_value, csv_file):
    try:
        with open(csv_file, 'r') as file:
            reader = csv.DictReader(file)
            updated_rows = []
            for row in reader:
                if row['Setting'] == setting:
                    row['Value'] = new_value
                updated_rows.append(row)

        with open(csv_file, 'w', newline='') as file:
            fieldnames = ['Setting', 'Value']
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(updated_rows)
    except Exception as e:
        print(f"Error updating CSV: {e}")

def read_program_state(csv_file):
    try:
        with open(csv_file, 'r', newline='') as file:
            reader = csv.DictReader(file)
            for row in reader:
                program = row.get('program', '').strip()  # Get and strip whitespace
                line = row.get('line', '').strip()  # Get and strip whitespace

                if program and line.isdigit():  # Check if program is not empty and line is a valid integer
                    return program, int(line)
    except Exception as e:
        print(f"Error reading program state: {e}")
    return None, None  # Return None if no valid data is found

def update_program_state(program, line, csv_file):
    try:
        with open(csv_file, 'r', newline='') as file:
            reader = list(csv.DictReader(file))

        if reader:
            reader[0]['program'] = program
            reader[0]['line'] = line

        with open(csv_file, 'w', newline='') as file:
            fieldnames = ['program', 'line']
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(reader)
    except Exception as e:
        print(f"Error updating program state: {e}")
RIGHT_MOTOR = int(read_setting('RIGHT_MOTOR', 'Hardware.csv'))
LEFT_MOTOR = int(read_setting('LEFT_MOTOR', 'Hardware.csv'))

LIFT_MOTOR = int(read_setting('LIFT_MOTOR', 'Hardware.csv'))
DRAG_MOTOR = int(read_setting('DRAG_MOTOR', 'Hardware.csv'))
ACC_PORT = read_setting('ACC_PORT', 'Hardware.csv')
LIFT_GEAR = int(read_setting('LIFT_GEAR', 'Hardware.csv'))
DRAG_GEAR = int(read_setting('DRAG_GEAR', 'Hardware.csv'))

BAUDRATE = int(read_setting('BAUDRATE', 'Hardware.csv'))
SERIAL_PORT = read_setting('SERIAL_PORT', 'Hardware.csv')
RADIUS = float(read_setting('RADIUS', 'Hardware.csv'))
WHEEL_DIA = float(read_setting('WHEEL_DIA', 'Hardware.csv'))
PPR = int(read_setting('PPR', 'Hardware.csv'))
VELOCITY = int(read_setting('VELOCITY', 'Hardware.csv'))
ACCELERATION = int(read_setting('ACCELERATION', 'Hardware.csv'))
DECELERATION = int(read_setting('DECELERATION', 'Hardware.csv'))
JOG_VEL = int(read_setting('JOG_VEL', 'Hardware.csv'))
JOG_ACC = int(read_setting('JOG_ACC', 'Hardware.csv'))
CURMODE = read_setting('CurMode', 'Hardware.csv')
LEFT_GEAR = int(read_setting('LEFT_GEAR', 'Hardware.csv'))
RIGHT_GEAR = int(read_setting('RIGHT_GEAR', 'Hardware.csv'))
LIDAR_PORT = read_setting('LIDAR_PORT', 'Hardware.csv')
LIDAR_MIN = int(read_setting('LIDAR_MIN', 'Hardware.csv'))
LIDAR_MAX = int(read_setting('LIDAR_MAX', 'Hardware.csv'))
LIDAR_DIST = float(read_setting('LIDAR_DIST', 'Hardware.csv'))
NINEDEG = int(read_setting('NINEDEG', 'Hardware.csv'))
# REDISPORT = int(read_setting('REDISPORT', 'Hardware.csv'))
ARUCO_THRESHOLD = float(read_setting('ARUCO_THRESHOLD', 'Hardware.csv'))
FOVERROR = float(read_setting('FOVERROR', 'Hardware.csv'))
ARUDIND = int(read_setting('ARUDIND', 'Hardware.csv'))/FOVERROR
ARUANGSTP = int(read_setting('ARUANGSTP', 'Hardware.csv'))
CAMTOCENTRE = float(read_setting('CAMTOCENTRE', 'Hardware.csv'))
BOTTOM_CAM = int(read_setting('BOTTOM_CAM', 'Hardware.csv'))
DSHOW = int(read_setting('DSHOW', 'Hardware.csv'))
FOVERROR = float(read_setting('FOVERROR', 'Hardware.csv'))
DEVICE_NAME = read_setting('DEVICE_NAME', 'Hardware.csv')
CONTROLUNIT = int(read_setting('CONTROLUNIT', 'Hardware.csv'))
PORTNO = int(read_setting('PORT', 'Hardware.csv'))
HYPTHRESHOLD = int(read_setting('HYPTHRESHOLD', 'markerDef.csv'))
TOLANG = float(read_setting('TOLANG', 'Hardware.csv'))
JOINT = read_setting('JOINT', 'multix_data.csv')
SPEED = int(read_setting('SPEED', 'multix_data.csv'))
START_POS = int(read_setting('START_POS', 'multix_data.csv'))
END_POS = int(read_setting('END_POS', 'multix_data.csv'))
R_STATUS = read_setting('R_STATUS', 'multix_data.csv')
C2COMPLETE = float(read_setting('C2COMPLETE', 'multix_data.csv'))
CC_COMPLETE = float(read_setting('CC_COMPLETE', 'multix_data.csv'))
def reloadCSV():
    try:
        global RIGHT_MOTOR, LEFT_MOTOR, BAUDRATE, SERIAL_PORT, RADIUS, WHEEL_DIA, PPR, BOTTOM_CAM
        global VELOCITY, ACCELERATION, DECELERATION, JOG_VEL, JOG_ACC, CURMODE, LEFT_GEAR, RIGHT_GEAR
        global LIDAR_PORT, LIDAR_MIN, LIDAR_MAX, LIDAR_DIST, NINEDEG, REDISPORT, ARUCO_THRESHOLD
        global ARUDIND, ARUANGSTP, CAMTOCENTRE, DSHOW, HYPTHRESHOLD, CONTROLUNIT, PORTNO,TOLANG
        global LIFT_MOTOR,DRAG_MOTOR,ACC_PORT,LIFT_GEAR,DRAG_GEAR
        global JOINT,SPEED,START_POS,END_POS,R_STATUS,C2COMPLETE,CC_COMPLETE

        LIFT_MOTOR = int(read_setting('LIFT_MOTOR', 'Hardware.csv'))
        DRAG_MOTOR = int(read_setting('DRAG_MOTOR', 'Hardware.csv'))
        ACC_PORT = read_setting('ACC_PORT', 'Hardware.csv')
        LIFT_GEAR = int(read_setting('LIFT_GEAR', 'Hardware.csv'))
        DRAG_GEAR = int(read_setting('DRAG_GEAR', 'Hardware.csv'))


        RIGHT_MOTOR = int(read_setting('RIGHT_MOTOR', 'Hardware.csv'))
        LEFT_MOTOR = int(read_setting('LEFT_MOTOR', 'Hardware.csv'))
        BAUDRATE = int(read_setting('BAUDRATE', 'Hardware.csv'))
        SERIAL_PORT = read_setting('SERIAL_PORT', 'Hardware.csv')
        RADIUS = float(read_setting('RADIUS', 'Hardware.csv'))
        WHEEL_DIA = float(read_setting('WHEEL_DIA', 'Hardware.csv'))
        PPR = int(read_setting('PPR', 'Hardware.csv'))
        VELOCITY = int(read_setting('VELOCITY', 'Hardware.csv'))
        ARUCO_THRESHOLD = float(read_setting('ARUCO_THRESHOLD', 'Hardware.csv'))
        FOVERROR = float(read_setting('FOVERROR', 'Hardware.csv'))
        ARUDIND = int(read_setting('ARUDIND', 'Hardware.csv')) / FOVERROR
        ARUANGSTP = int(read_setting('ARUANGSTP', 'Hardware.csv'))
        CAMTOCENTRE = float(read_setting('CAMTOCENTRE', 'Hardware.csv'))
        BOTTOM_CAM = int(read_setting('BOTTOM_CAM', 'Hardware.csv'))
        DSHOW = int(read_setting('DSHOW', 'Hardware.csv'))
        ACCELERATION = int(read_setting('ACCELERATION', 'Hardware.csv'))
        DECELERATION = int(read_setting('DECELERATION', 'Hardware.csv'))
        JOG_VEL = int(read_setting('JOG_VEL', 'Hardware.csv'))
        JOG_ACC = int(read_setting('JOG_ACC', 'Hardware.csv'))
        LEFT_GEAR = int(read_setting('LEFT_GEAR', 'Hardware.csv'))
        RIGHT_GEAR = int(read_setting('RIGHT_GEAR', 'Hardware.csv'))
        LIDAR_PORT = read_setting('LIDAR_PORT', 'Hardware.csv')
        LIDAR_MIN = int(read_setting('LIDAR_MIN', 'Hardware.csv'))
        LIDAR_MAX = int(read_setting('LIDAR_MAX', 'Hardware.csv'))
        LIDAR_DIST = float(read_setting('LIDAR_DIST', 'Hardware.csv'))
        NINEDEG = int(read_setting('NINEDEG', 'Hardware.csv'))
        # REDISPORT = int(read_setting('REDISPORT', 'Hardware.csv'))
        PORTNO = int(read_setting('PORT', 'Hardware.csv'))
        CONTROLUNIT = int(read_setting('CONTROLUNIT', 'Hardware.csv'))
        HYPTHRESHOLD = int(read_setting('HYPTHRESHOLD', 'markerDef.csv'))
        TOLANG = float(read_setting('TOLANG', 'Hardware.csv'))

        JOINT = read_setting('JOINT', 'multix_data.csv')
        SPEED = float(read_setting('SPEED', 'multix_data.csv'))
        START_POS = float(read_setting('START_POS', 'multix_data.csv'))
        END_POS = float(read_setting('START_POS', 'multix_data.csv'))
        R_STATUS = read_setting('R_STATUS', 'multix_data.csv')
        C2COMPLETE = float(read_setting('C2COMPLETE', 'multix_data.csv'))
        CC_COMPLETE = float(read_setting('CC_COMPLETE', 'multix_data.csv'))
    except Exception as e:
        print(f"Error reloading CSV: {e}")

# Additional helper functions
def reloadPos():
    try:
        global CURMODE, LCURPOS, LTARPOS, RCURPOS, RTARPOS, Ldir, Rdir
        # Reload or update positional values here
    except Exception as e:
        print(f"Error reloading positions: {e}")

def reloadSpeedAcc():
    try:
        global VELOCITY, JOG_ACC, JOG_VEL, ACCELERATION, DECELERATION

        VELOCITY = int(read_setting('VELOCITY', 'Hardware.csv'))
        ACCELERATION = int(read_setting('ACCELERATION', 'Hardware.csv'))
        DECELERATION = int(read_setting('DECELERATION', 'Hardware.csv'))
        JOG_VEL = int(read_setting('JOG_VEL', 'Hardware.csv'))
        JOG_ACC = int(read_setting('JOG_ACC', 'Hardware.csv'))
    except Exception as e:
        print(f"Error reloading speed/acceleration settings: {e}")

# Initial load of settings
# reloadCSV()
# reloadPos()
