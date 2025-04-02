# ______________________________________
def set_pr_absolute_mode(self, motor_name, position=200000, velocity=None, acceleration=None, deceleration=None):
    """
    Set PR (Position Registration) mode to absolute position
    Args:
        motor_name: The name of the motor as defined in MOTOR_ADDRESSES
        position: Target position in pulses (default 200000, which is 10000 pulse/rev * 20 revs)
        velocity: Velocity for the movement (optional)
        acceleration: Acceleration for the movement (optional)
        deceleration: Deceleration for the movement (optional)
    """
    # Convert position to high and low bits
    position_high = (position >> 16) & 0xFFFF
    position_low = position & 0xFFFF

    # Set PR mode as absolute position
    self.write_register(motor_name, 0x0017, 0xB3)  # According to data frame 1 in manual

    # Set position high and low bits
    self.write_register(motor_name, 0x0007, position_high)  # High word
    self.write_register(motor_name, 0x0032, position_low)  # Low word

    # Set optional parameters if provided
    if velocity is not None:
        self.write_register(motor_name, 0x0056, velocity)
    if acceleration is not None:
        self.write_register(motor_name, 0x0066, acceleration)
    if deceleration is not None:
        self.write_register(motor_name, 0x0037, deceleration)

    # Trigger PR0 motion
    self.write_register(motor_name, 0x0037, 0xC6)


def set_pr_relative_mode(self, motor_name, distance=10000, velocity=None, acceleration=None, deceleration=None):
    """
    Set PR (Position Registration) mode to relative distance
    Args:
        motor_name: The name of the motor as defined in MOTOR_ADDRESSES
        distance: Relative distance in pulses (default 10000, which is 10000 pulse/rev * 1 rev)
        velocity: Velocity for the movement (optional)
        acceleration: Acceleration for the movement (optional)
        deceleration: Deceleration for the movement (optional)
    """
    # Convert distance to high and low bits
    distance_high = (distance >> 16) & 0xFFFF
    distance_low = distance & 0xFFFF

    # Set PR mode as relative position
    self.write_register(motor_name, 0x0156, 0x42)  # According to data frame 1 in manual

    # Set position high and low bits
    self.write_register(motor_name, 0x00C7, distance_high)  # High word
    self.write_register(motor_name, 0x002D, distance_low)  # Low word

    # Set optional parameters if provided
    if velocity is not None:
        self.write_register(motor_name, 0x0056, velocity)
    if acceleration is not None:
        self.write_register(motor_name, 0x0066, acceleration)
    if deceleration is not None:
        self.write_register(motor_name, 0x00A6, deceleration)

    # Trigger PR0 motion
    self.write_register(motor_name, 0x0037, 0xC6)


def set_pr_velocity_mode(self, motor_name, velocity=500, acceleration=None, deceleration=None):
    """
    Set PR (Position Registration) mode to velocity mode
    Args:
        motor_name: The name of the motor as defined in MOTOR_ADDRESSES
        velocity: Target velocity in rpm (default 500)
        acceleration: Acceleration for reaching the velocity (optional)
        deceleration: Deceleration for stopping (optional)
    """
    # Set PR mode as velocity mode
    self.write_register(motor_name, 0x0217, 0xB3)

    # Set velocity
    self.write_register(motor_name, 0x0056, velocity)

    # Set optional parameters if provided
    if acceleration is not None:
        self.write_register(motor_name, 0x0056, acceleration)
    if deceleration is not None:
        self.write_register(motor_name, 0x00A6, deceleration)

    # Trigger PR0 motion
    self.write_register(motor_name, 0x0037, 0xC6)


def set_pr1_absolute_mode(self, motor_name, position=200000, velocity=None, acceleration=None, deceleration=None):
    """
    Set PR1 mode to absolute position
    Args:
        motor_name: The name of the motor as defined in MOTOR_ADDRESSES
        position: Target position in pulses (default 200000)
        velocity: Velocity for the movement (optional)
        acceleration: Acceleration for the movement (optional)
        deceleration: Deceleration for the movement (optional)
    """
    # Convert position to high and low bits
    position_high = (position >> 16) & 0xFFFF
    position_low = position & 0xFFFF

    # Set PR1 mode
    self.write_register(motor_name, 0x00D6, 0x70)

    # Set position high and low bits
    self.write_register(motor_name, 0x00C7, position_high)  # High word
    self.write_register(motor_name, 0x00F3, position_low)  # Low word

    # Set optional parameters if provided
    if velocity is not None:
        self.write_register(motor_name, 0x00E7, velocity)
    if acceleration is not None:
        self.write_register(motor_name, 0x0075, acceleration)
    if deceleration is not None:
        self.write_register(motor_name, 0x0064, deceleration)

    # Trigger PR1 motion
    self.write_register(motor_name, 0x0011, 0xE6)


def set_pr1_velocity_mode(self, motor_name, velocity=300, acceleration=None, deceleration=None):
    """
    Set PR1 to velocity mode with specified velocity
    Args:
        motor_name: The name of the motor as defined in MOTOR_ADDRESSES
        velocity: Target velocity in rpm (default 300)
        acceleration: Acceleration for reaching the velocity (optional)
        deceleration: Deceleration for stopping (optional)
    """
    # Set PR1 as velocity mode
    self.write_register(motor_name, 0x0096, 0x71)

    # Set velocity
    self.write_register(motor_name, 0x00E7, velocity)

    # Set optional parameters if provided
    if acceleration is not None:
        self.write_register(motor_name, 0x00F9, acceleration)
    if deceleration is not None:
        self.write_register(motor_name, 0x0064, deceleration)

    # Trigger PR1 motion
    self.write_register(motor_name, 0x0011, 0xE6)


def set_homing_mode(self, motor_name, homing_method=0, high_velocity=1000, low_velocity=100):
    """
    Configure and trigger homing operation
    Args:
        motor_name: The name of the motor as defined in MOTOR_ADDRESSES
        homing_method: Homing method code (refer to manual for specific codes)
        high_velocity: Fast search velocity during homing
        low_velocity: Slow search velocity during homing
    """
    # Set homing method
    self.write_register(motor_name, 0x00B7, 0xC8)

    # Set homing velocities
    self.write_register(motor_name, 0x00A6, high_velocity)  # High velocity
    self.write_register(motor_name, 0x0016, low_velocity)  # Low velocity

    # Trigger homing
    self.write_register(motor_name, 0x0037, 0xD2)


def stop_motion(self, motor_name, emergency=False):
    """
    Stop the current motion
    Args:
        motor_name: The name of the motor as defined in MOTOR_ADDRESSES
        emergency: If True, send emergency stop; otherwise normal stop
    """
    if emergency:
        # Send emergency stop datagram
        self.write_register(motor_name, 0x0037, 0xFA)
    else:
        # Normal stop (implementation depends on specific drive settings)
        # This might need adjustment based on your specific servo parameters
        self.write_register(motor_name, 0x0003, 0)  # Disable servo operation


def configure_internal_speed_mode(self, motor_name, speed_mode=1):
    """
    Configure the servo to use internal speed mode
    Args:
        motor_name: The name of the motor as defined in MOTOR_ADDRESSES
        speed_mode: 0=Analog, 1=Internal 4 speeds, 2=Internal 3 + Analog, 3=Internal 8 speeds
    """
    # Set to velocity control mode first (Pr0.01 = 1)
    self.write_register(motor_name, 0x0001, 1)

    # Set the velocity command source (Pr3.00)
    self.write_register(motor_name, 0x0301, speed_mode)


def set_internal_speeds(self, motor_name, speed1=500, speed2=500, speed3=500, speed4=500,
                        speed5=None, speed6=None, speed7=None, speed8=None):
    """
    Set internal speed presets for velocity mode
    Args:
        motor_name: The name of the motor as defined in MOTOR_ADDRESSES
        speed1-speed8: Speed settings in rpm (typically ranging from -5000 to +5000)
    """
    # Set the 1st to 4th speeds (always available)
    self.write_register(motor_name, 0x0309, speed1)  # Pr3.04 (1st speed)
    self.write_register(motor_name, 0x030B, speed2)  # Pr3.05 (2nd speed)
    self.write_register(motor_name, 0x030D, speed3)  # Pr3.06 (3rd speed)
    self.write_register(motor_name, 0x030F, speed4)  # Pr3.07 (4th speed)

    # Set 5th to 8th speeds if provided and if in 8-speed mode
    if speed5 is not None:
        self.write_register(motor_name, 0x0311, speed5)  # Pr3.08 (5th speed)
    if speed6 is not None:
        self.write_register(motor_name, 0x0313, speed6)  # Pr3.09 (6th speed)
    if speed7 is not None:
        self.write_register(motor_name, 0x0315, speed7)  # Pr3.10 (7th speed)
    if speed8 is not None:
        self.write_register(motor_name, 0x0317, speed8)  # Pr3.11 (8th speed)


def read_motor_status(self, motor_name):
    """
    Read various status parameters from the motor
    Args:
        motor_name: The name of the motor as defined in MOTOR_ADDRESSES
    Returns:
        dict: Dictionary containing status information
    """
    # Read various status registers
    try:
        # These register addresses may need adjustment based on your manual
        actual_position = self.read_register(motor_name, 0x0602)  # Actual position
        actual_velocity = self.read_register(motor_name, 0x0604)  # Actual velocity
        status_word = self.read_register(motor_name, 0x0600)  # Status word

        return {
            "position": actual_position,
            "velocity": actual_velocity,
            "status": status_word,
            # Add more status parameters as needed
        }
    except Exception as e:
        print(f"Error reading motor status: {e}")
        return None
    # ________________________________________________


