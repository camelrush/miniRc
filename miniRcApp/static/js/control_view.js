const UPDATE_TIME = 100;
const BUTTON_RADIUS = 10;
const HVAL_MAX = 52;
const HVAL_INTERVAL = 15;
const VVAL_MAX = 256;
const VVAL_INTERVAL = 20;

var timer;

var cv_steering,cv_speed;
var cv_camangleH,cv_camangleV;

$(document).ready(function() {

    cv_steering = new controller($('#steering-ctrl-cvs')[0], 'horizon');
    cv_speed = new controller($('#speed-ctrl-cvs')[0], 'virtical');
    cv_camangleH = new controller($('#camangle-h-ctrl-cvs')[0], 'horizon');
    cv_camangleV = new controller($('#camangle-v-ctrl-cvs')[0], 'virtical');

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

    // Canvasを更新
    cv_steering.updateCanvas();
    cv_speed.updateCanvas();
    cv_camangleH.updateCanvas();
    cv_camangleV.updateCanvas();

    // 送信値を取得
    if (cv_steering.updateCanvas()  || 
        cv_speed.updateCanvas() || 
        cv_camangleH.updateCanvas() || 
        cv_camangleV.updateCanvas()) {

            var data = {
            direction: "left",
            virtical: vval,
            horizon: hval
            };

            $.ajax({
                type: "POST",
                url: "http://192.168.43.110:3000/motor/",
                data: data,
                dataType: "html"
            }).done(function(data, textStatus, jqXHR) {
                //alert(data);
            }).fail(function(data, textStatus, jqXHR) {
                //alert(data);
            });
        }
    }
}

class controller {

    _canvas = null;
    _ctx = null;
    _orientation = null;
    _centerX = 0;
    _centerY = 0;
    _posX = 0;
    _posY = 0;
    _onTouch = false;

    constructor(canvas, orientation) {

        // 引数を格納
        this._canvas = canvas;
        this._orientation = orientation;

        // コンテキスト取得
        this._ctx = canvas.getContext('2d');

        // レバーを中央に配置(初期位置)
        this._centerX = canvas.width / 2;
        this._centerY = canvas.height / 2;
        this._posX = this._centerX;
        this._posY = this._centerY;

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
                this._posX = this._calcPos(inputX, 0, this._canvas.width);
            }
            if (this._orientation == 'virtical') {
                var inputY = Math.floor(touch.clientY - bounds.top);
                this._posY = this._calcPos(inputY, 0, this._canvas.height);
            }
        });

        // イベントハンドラ(タッチ終了)
        this._canvas.addEventListener('touchend', e => {
            this._onTouch = false;
        });
    };

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
    };

    // 画面更新処理
    updateCanvas() {

        old_posX = this._posX
        old_posY = this._posY

        // 領域を初期化
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        // 非操作時には少しずつ中央にカーソルを戻す
        if (!this._onTouch) {
            if (this._posX != this._centerX) {
                // ボタン座標を計算
                var sub = ((this._centerX - this._posX) / 2);
                sub = (sub < 0 ? Math.floor(sub) : Math.ceil(sub));
                this._posX = this._posX + sub;
            }
            if (this._posY != this._centerY) {
                // ボタン座標を計算
                var sub = ((this._centerY - this._posY) / 2);
                sub = (sub < 0 ? Math.floor(sub) : Math.ceil(sub));
                this._posY = this._posY + sub;
            }
        }

        // 操作領域を描画
        this._ctx.beginPath();
        this._ctx.lineWidth = 10;
        this._ctx.strokeStyle = 'rgb(80,80,80)';
        this._ctx.lineCap = 'round';
        if (this._orientation == 'horizon') {
            this._ctx.moveTo(BUTTON_RADIUS, this._centerY);
            this._ctx.lineTo(this._canvas.width - BUTTON_RADIUS, this._centerY);
        }
        if (this._orientation == 'virtical') {
            this._ctx.moveTo(this._centerX, BUTTON_RADIUS);
            this._ctx.lineTo(this._centerX, this._canvas.height - BUTTON_RADIUS);
        }
        this._ctx.stroke();

        // ボタン●を描画
        this._ctx.beginPath();
        this._ctx.arc(this._posX, this._posY, BUTTON_RADIUS, 0, Math.PI * 2, false);
        this._ctx.fillStyle = 'rgb(255,255,255)';
        this._ctx.fill();

        // 戻り値(変化有無)を返却
        return ((this._posX != old_posX) || (this._posY != old_posY))
    };

    getSendVal(maxVal, interval) {
        var val;
        if (this._orientation == 'horizon') {
            val = (Math.round((maxVal * 2) * (this._posX / this._canvas.width)) - maxVal);
        }
        if (this._orientation == 'virtical') {
            val = (Math.round((maxVal * 2) * (this._posY / this._canvas.height)) - maxVal);
            val = val * -1;
        }
        return val - (val % interval);
    };

    getStatus() {
        return (this._onTouch ? 1 : 0);
    };
}