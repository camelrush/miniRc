import pigpio
import time

MOTOR_OUT1_PIN = 23
MOTOR_OUT2_PIN = 24
MOTOR_OPWM_PIN = 21
FREQ = 100
RANGE = 255

class cdc():
    def __init__(self):
        self.pig = pigpio.pi()

    def drive(self ,speed):
        if speed < 0:
            self.pig.write(MOTOR_OUT1_PIN ,1)
            self.pig.write(MOTOR_OUT2_PIN ,0)
        if speed > 0:
            self.pig.write(MOTOR_OUT1_PIN ,0)
            self.pig.write(MOTOR_OUT2_PIN ,1)
        if speed == 0:
            self.pig.write(MOTOR_OUT1_PIN ,0)
            self.pig.write(MOTOR_OUT2_PIN ,0)

        self.pig.set_PWM_dutycycle(MOTOR_OPWM_PIN, abs(speed))

