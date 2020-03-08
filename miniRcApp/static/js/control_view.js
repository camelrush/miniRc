var API_POST_URL = "http://192.168.3.11:3000/ctrlapi/";
var ADJUST_INTERVAL = 50;  // ms

var camangleH_controller;
var camangleV_controller;
var steering_controller;
var speed_controller;
var adjust_timer;

$(document).ready(function() {

    // カメラ制御(水平)
    camangleH_controller = new OneWayController($('#camangle-h-ctrl-cvs')[0], $('#camangle-h-ctrl-val') ,change_value ,
                    {orientation :"horizon" , maxvalue :20 ,threshold :2});

    // カメラ制御(垂直)
    camangleV_controller = new OneWayController($('#camangle-v-ctrl-cvs')[0], $('#camangle-v-ctrl-val') ,change_value ,
                    {orientation :"virtical" ,maxvalue :20 ,threshold :2});

    // ステアリング制御
    steering_controller = new OneWayController($('#steering-ctrl-cvs')[0] , $('#steering-ctrl-val'),change_value ,
                    {orientation :"horizon" ,maxvalue :10 ,threshold :1});

    // スピード制御
    speed_controller = new OneWayController($('#speed-ctrl-cvs')[0], $('#speed-ctrl-val') ,change_value ,
                    {orientation :"virtical" ,maxvalue :255 ,threshold :15});

    // 自動調整タイマー設定
    this._adjust_timer = setInterval(autoAdjust ,ADJUST_INTERVAL);

    // ==============================================================
    // Ajax to django by POST functions has probrem.
    // refer to https://docs.djangoproject.com/en/dev/ref/csrf/#ajax
    // ==============================================================
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
});

$(window).on('load',function() {

    // カメラ画像領域を追加
    $('#capture-view').append('<iframe id="capture-frame" src="./capture">');
    $('#capture-view').css('width','160px');
    $('#capture-view').css('height','120px');
    $('#capture-view').css('float','left');
    $('#capture-view').css('margin-top','40px');
    $('#capture-frame').css('width','160px');
    $('#capture-frame').css('height','120px');
    $('#capture-frame').css('border-style','none');
    $('#capture-frame').css('border-radius','10px');

});

function autoAdjust(){
    steering_controller.autoAdjust();
    speed_controller.autoAdjust();
}

function change_value(){

    var data = {
        camangle_h: camangleH_controller.getValue(),
        camangle_v: camangleV_controller.getValue(),
        steering: steering_controller.getValue(),
        speed: speed_controller.getValue()
    };

    $.ajax({
        type: "POST",
        url: API_POST_URL,
        data: data,
        dataType: "html"
    }).done(function(data, textStatus, jqXHR) {
        //alert(data);
    }).fail(function(data, textStatus, jqXHR) {
        //alert(data);
    });
}
