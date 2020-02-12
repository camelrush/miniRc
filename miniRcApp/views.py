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
    control = direction.Direction.get_control(request.POST.get("direction"))
    print(request.POST.get("horizon"))
    print(request.POST.get("virtical"))
    if not control is None:
        th = threading.Thread(target=action_exec(control))
        th.start()
    return HttpResponse("forward:" + str(apps.forward_val) + " turn:" + str(apps.turn_val))

def index_template(request):
    return render(request, 'index.html')

def action_exec(control):
    control.action()
    time.sleep(ON_CONTINUE_SECONDS)
