from django.http.response import HttpResponse,StreamingHttpResponse
from django.shortcuts import render
from django.views.decorators import gzip
from django.views.decorators.clickjacking import xframe_options_exempt
from .devices.motor import ServoMotorSG92 as SG92
from .devices.motor import DcMotorFA130RA as FA130RA
from .devices.camera import VideoCamera as cam

# GPIO.PIN定義
GPIO_CTRL_SERVO_PWM = 18    # DCモータPWM出力
GPIO_CTRL_DC_OUT1 = 23      # DCモータ出力1
GPIO_CTRL_DC_OUT2 = 24      # DCモータ出力2
GPIO_CTRL_DC_PWM = 21       # ステアリング用サーボ出力
GPIO_CAMERA_H_PWM = 16      # カメラ用水平サーボ出力
GPIO_CAMERA_V_PWM = 20      # カメラ用垂直サーボ出力

ctrl_servo = SG92(GPIO_CTRL_SERVO_PWM)
ctrl_dc = FA130RA( \
    GPIO_CTRL_DC_OUT1 , \
    GPIO_CTRL_DC_OUT2 , \
    GPIO_CTRL_DC_PWM)
camera_servo_h = SG92(GPIO_CAMERA_H_PWM)
camera_servo_v = SG92(GPIO_CAMERA_V_PWM)

def _gen(camera):
    while True:
        # カメラ画像1フレーム取得
        frame = camera.get_frame()
        # 1フレームデータ返却
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')
               
# Create your views here.
# =================================
#  web routing '/' → index
# =================================
def control_view(request):
    return render(request, 'control_view.html')

# =================================
#  web routing '/capture' → capture
#  ※index内にインラインフレームで表示
# =================================
@ gzip.gzip_page
@ xframe_options_exempt
def capture(request):
    #return render(request, 'test.html')
    return StreamingHttpResponse(_gen(cam()),content_type='multipart/x-mixed-replace; boundary=frame')

# =================================
#  web routing '/ctrlapi' → ctrlapi
# =================================
def control(request):

    steering = request.POST.get("steering")
    speed = request.POST.get("speed")
    camangle_h = request.POST.get("camangle_h")
    camangle_v = request.POST.get("camangle_v")

    print("steering:" + steering + " speed:" + speed + 
      " / camanle h:" + camangle_h + " camangle v:" + camangle_v)

    ctrl_servo.move(float(steering))
    ctrl_dc.drive(int(speed))
    camera_servo_h.move(float(camangle_h) * -1)
    camera_servo_v.move(float(camangle_v) * -1)

    return HttpResponse("")
