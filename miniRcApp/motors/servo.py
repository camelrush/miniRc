import pigpio
import time

SERVO_PIN = 18  # GPIO
START_V = 500   # us
END_V = 2400    # us

class cservo:
    def __init__(self):
        self.pig = pigpio.pi()

    def get_pulsewidth(self ,angle):
        angle += 45.0
        if angle < 0.0:
            angle = 0.0
        if angle > 90.0:
            angle = 90.0
        pw = (END_V - START_V) * (float(angle) / 90.0) + START_V
        return pw 

    def steering(self ,angle):
        pw = self.get_pulsewidth(float(angle))
        self.pig.set_servo_pulsewidth(SERVO_PIN ,pw)

