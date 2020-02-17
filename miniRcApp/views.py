from django.http.response import HttpResponse
from django.shortcuts import render
from . import apps
from .motors import servo,dc

# final int
ON_CONTINUE_SECONDS = 0

svm = servo.cservo()
dcm = dc.cdc()

# Create your views here.
def control(request):
    hval = request.POST.get("horizon")
    vval = request.POST.get("virtical")
    print("h:" + hval + " v:" + vval)
    svm.steering(float(hval))
    dcm.drive(int(vval))
    return HttpResponse("forward:" + str(apps.forward_val) + " turn:" + str(apps.turn_val))

def index_template(request):
    return render(request, 'index.html')

def index2_template(request):
    return render(request, 'control_canvas.html')
