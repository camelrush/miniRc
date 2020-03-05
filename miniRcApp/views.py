from django.http.response import HttpResponse
from django.shortcuts import render
from .devices.motor import ServoMotorSG92 as SG92
from .devices.motor import DcMotorFA130RA as FA130RA

# final int
GPIO_CTRL_SERVO_PWM = 18
GPIO_CTRL_DC_OUT1 = 23
GPIO_CTRL_DC_OUT2 = 24
GPIO_CTRL_DC_PWM = 21
GPIO_CAMERA_V_PWM = 16
GPIO_CAMERA_H_PWM = 20

ctrl_servo = SG92(GPIO_CTRL_SERVO_PWM)
ctrl_dc = FA130RA( \
    GPIO_CTRL_DC_OUT1 , \
    GPIO_CTRL_DC_OUT2 , \
    GPIO_CTRL_DC_PWM)
camera_servo_h = SG92(GPIO_CAMERA_V_PWM)
camera_servo_v = SG92(GPIO_CAMERA_H_PWM)

# Create your views here.
def control(request):

    steering = request.POST.get("steering")
    speed = request.POST.get("speed")
    camangle_h = request.POST.get("camangle_h")
    camangle_v = request.POST.get("camangle_v")

    print("steering:" + steering + " speed:" + speed + 
      " / camanle h:" + camangle_h + " camangle v:" + camangle_v)

    ctrl_servo.move(float(steering))
    ctrl_dc.drive(int(speed))
    camera_servo_h.move(float(camangle_h))
    camera_servo_v.move(float(camangle_v))

    return HttpResponse("")

def control_view(request):
    return render(request, 'control_view.html')
