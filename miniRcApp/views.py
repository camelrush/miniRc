from django.http.response import HttpResponse
from django.shortcuts import render
import time
import threading
import asyncio
from . import apps
from . import direction

# final int
ON_CONTINUE_SECONDS = 3

# Create your views here.
def control(request):
    control = direction.Direction.get_control(request.GET.get("direction"))
    if not control is None:
        th = threading.Thread(target=action_exec(control))
        th.start()

    return HttpResponse("forward:" + str(apps.forward_val) + " turn:" + str(apps.turn_val))
'''
    PIN1 = 4
    PIN2 = 17
    pi = pigpio.pi()
    try:
        setup_PWM(PIN1 ,200, 100)
        setup_PWM(PIN2 ,10, 100)
        for i in range(3):
            lighting(PIN1 ,100 ,10 ,0.05)
            lighting(PIN2 ,100 ,10 ,0.05)
    except KeyboardInterrupt:
        pass

def setup_PWM(PIN ,f ,r):
    pi.set_PWM_frequecy(PIN ,f)
    pi.set_PWM_range(PIN ,r)

def lighting(PIN ,vmax ,d, t):
    v = 0
    while v>= 0:
        pi.set_PWM_dutycycle(PIN ,v)
        time.sleep(t)
        if v >= vmax:
            d = d * -1
            v = v + d

'''

def index_template(request):
    return render(request, 'index.html')

def action_exec(control):
    control.action()
    time.sleep(ON_CONTINUE_SECONDS)
