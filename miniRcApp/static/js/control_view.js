var UPDATE_TIME = 100;
var BUTTON_RADIUS = 10;
var HVAL_MAX = 52;
var HVAL_INTERVAL = 15;
var VVAL_MAX = 256;
var VVAL_INTERVAL = 20;

var timer;
var cv_steering;
var cv_speed;
var cv_camangleH;
var cv_camangleV;

$(document).ready(function() {

    cv_steering = new controller($('#steering-ctrl-cvs')[0] , $('#steering-ctrl-val'), 'horizon');
    cv_speed = new controller($('#speed-ctrl-cvs')[0], $('#speed-ctrl-val') ,'virtical');
    cv_camangleH = new controller($('#camangle-h-ctrl-cvs')[0], $('#camangle-h-ctrl-val') , 'horizon');
    cv_camangleV = new controller($('#camangle-v-ctrl-cvs')[0], $('#camangle-v-ctrl-val') , 'virtical');

    timer = setInterval(updateController, UPDATE_TIME);

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

function updateController() {

    // 画面更新
    // 値変化があった場合、APIにリクエストする
    if (cv_steering.updateView() || cv_speed.updateView() || cv_camangleH.updateView() || cv_camangleV.updateView()) {

        var steering_val = cv_steering.getSendVal(HVAL_MAX,HVAL_INTERVAL);
        var speed_val = cv_speed.getSendVal(VVAL_MAX,VVAL_INTERVAL);
        var camangleH_val = cv_camangleH.getSendVal(HVAL_MAX,HVAL_INTERVAL);
        var camangleV_val = cv_camangleV.getSendVal(VVAL_MAX,VVAL_INTERVAL);

        cv_steering.updateValue(steering_val);
        cv_speed.updateValue(speed_val);
        cv_camangleH.updateValue(camangleH_val);
        cv_camangleV.updateValue(camangleV_val);

        var data = {
            steering: steering_val,
            speed: speed_val,
            camangle_h: camangleH_val, 
            camangle_v: camangleV_val 
        };

        $.ajax({
            type: "POST",
            url: "http://192.168.43.247:3000/ctrlapi/",
            data: data,
            dataType: "html"
        }).done(function(data, textStatus, jqXHR) {
            //alert(data);
        }).fail(function(data, textStatus, jqXHR) {
            //alert(data);
        });
    }
}

class controller {

    _canvas = null;
    _val = null;
    _ctx = null;
    _orientation = null;
    _onTouch = false;
    _centerPos = 0;
    _curPos = 0;
    _oldPos = 0;

    constructor(canvas ,val , orientation) {

        // 引数を格納
        this._canvas = canvas;
        this._val = val;
        this._orientation = orientation;

        // コンテキスト取得
        this._ctx = canvas.getContext('2d');

        // レバーを中央に配置(初期位置)
        if (this._orientation == 'horizon'){
            this._centerPos = canvas.width / 2;
        } else {
            this._centerPos = canvas.height / 2;
        }
        this._curPos = this._centerPos;

        // イベントハンドラ(タッチ開始)
        this._canvas.addEventListener('touchstart', e => {
            this._onTouch = true;
        });

        // イベントハンドラ(タッチ移動)
        this._canvas.addEventListener('touchmove', e => {

            var bounds = e.target.getBoundingClientRect();
            var touch = event.targetTouches[0];

            // スクロール抑止
            e.preventDefault();

            // タッチ位置にボタン座標を移動
            // (描画はupdateCanvasで行う)
            if (this._orientation == 'horizon') {
                var inputX = Math.floor(touch.clientX - bounds.left);
                this._curPos = this._calcPos(inputX, 0, this._canvas.width);
            }
            if (this._orientation == 'virtical') {
                var inputY = Math.floor(touch.clientY - bounds.top);
                this._curPos = this._calcPos(inputY, 0, this._canvas.height);
            }
        });

        // イベントハンドラ(タッチ終了)
        this._canvas.addEventListener('touchend', e => {
            this._onTouch = false;
        });
    }

    // ボタン中心座標計算処理
    _calcPos(inputPos, minPos, maxPos) {
        if (inputPos > (maxPos - BUTTON_RADIUS)) {
            // 入力位置 > 領域上限
            return (maxPos - BUTTON_RADIUS);
        } else if (inputPos < BUTTON_RADIUS) {
            // 入力位置 < 領域下限
            return BUTTON_RADIUS;
        } else {
            // 領域下限 < 入力位置 < 領域上下
            return inputPos;
        }
    }

    // 画面更新処理
    updateView() {

        // 領域を初期化
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        // 非操作時にはカーソルを中央位置に戻していく
        if (!this._onTouch) {
            if (this._curPos != this._centerPos) {
                // ボタン座標を計算
                var sub = ((this._centerPos - this._curPos) / 2);
                sub = (sub < 0 ? Math.floor(sub) : Math.ceil(sub));
                this._curPos = this._curPos + sub;
            }
        }

        // 操作領域を描画
        this._ctx.beginPath();
        this._ctx.lineWidth = 10;
        this._ctx.strokeStyle = 'rgb(80,80,80)';
        this._ctx.lineCap = 'round';
        if (this._orientation == 'horizon') {
            this._ctx.moveTo(BUTTON_RADIUS, this._centerPos);
            this._ctx.lineTo(this._canvas.width - BUTTON_RADIUS, this._centerPos);
        }
        if (this._orientation == 'virtical') {
            this._ctx.moveTo(this._centerPos, BUTTON_RADIUS);
            this._ctx.lineTo(this._centerPos, this._canvas.height - BUTTON_RADIUS);
        }
        this._ctx.stroke();

        // ボタン●を描画
        this._ctx.beginPath();
        var circleX,circleY = 0;
        if (this._orientation == 'horizon') {
            circleX = this._curPos;
            circleY = this._canvas.height / 2;
        }
        if (this._orientation == 'virtical') {
            circleX = this._canvas.width / 2;
            circleY = this._curPos;
        }

        this._ctx.arc(circleX, circleY, BUTTON_RADIUS, 0, Math.PI * 2, false);
        this._ctx.fillStyle = 'rgb(255,255,255)';
        this._ctx.fill();

        var change_flg = (this._oldPos != this._curPos);
        this._oldPos = this._curPos;
        return change_flg;
    }

    updateValue(val){
        this._val.text(val);
    }

    getSendVal(maxVal, interval) {
        var val;
        if (this._orientation == 'horizon') {
            val = (Math.round((maxVal * 2) * (this._curPos / this._canvas.width)) - maxVal);
        }
        if (this._orientation == 'virtical') {
            val = (Math.round((maxVal * 2) * (this._curPos / this._canvas.height)) - maxVal);
            val = val * -1;
        }
        return val - (val % interval);
    }

    getStatus() {
        return (this._onTouch ? 1 : 0);
    }
}