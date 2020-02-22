const UPDATE_TIME = 50;
const BUTTON_RADIUS = 10;
const HVAL_MAX = 52;
const VVAL_MAX = 256;

var timer;
var ctrl_horizon;
var ctrl_virtical;

$(document).ready(function() {

    // 水平canvasにレバーを生成
    var canvas_horizon = $('#cvs-ch')[0];
    ctrl_horizon = new controller(canvas_horizon, 'horizon');

    // 垂直canvasにレバーを生成
    var canvas_virtical = $('#cvs-cv')[0];
    ctrl_virtical = new controller(canvas_virtical, 'virtical');

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

    var hval_old = ctrl_horizon.getSendVal(HVAL_MAX);
    var vval_old = ctrl_virtical.getSendVal(VVAL_MAX);

    // Canvasを更新
    ctrl_horizon.updateCanvas();
    ctrl_virtical.updateCanvas();

    // 送信値を取得
    var hval = ctrl_horizon.getSendVal(HVAL_MAX);
    var vval = ctrl_virtical.getSendVal(VVAL_MAX);

    console.log('oldh:' + hval_old + ' oldv:' + vval_old + ' h:' + hval + ' v:' + vval);

    if ((ctrl_horizon.getStatus() == 1) || (hval_old != hval) ||
        (ctrl_virtical.getStatus() == 1) || (vval_old != vval)) {
        var data = {
            direction: "left",
            virtical: vval,
            horizon: hval
        };

        $.ajax({
            type: "POST",
            url: "http://192.168.43.110:3000/control/",
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
    _ctx = null;
    _orientation = null;
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
        this._posX = canvas.width / 2;
        this._posY = canvas.height / 2;

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
        var cw = this._canvas.width;
        var ch = this._canvas.height;

        // 領域を初期化
        this._ctx.clearRect(0, 0, cw, ch);

        // 非操作時には少しずつ中央にカーソルを戻す
        if (!this._onTouch) {
            if (this._posX != (cw / 2)) {
                // ボタン座標を計算
                var sub = (((cw / 2) - this._posX) / 2);
                sub = (sub < 0 ? Math.floor(sub) : Math.ceil(sub));
                this._posX = this._posX + sub;
            }
            if (this._posY != (ch / 2)) {
                // ボタン座標を計算
                var sub = (((ch / 2) - this._posY) / 2);
                sub = (sub < 0 ? Math.floor(sub) : Math.ceil(sub));
                this._posY = this._posY + sub;
            }
        }

        // ボタン●を描画
        this._ctx.beginPath();
        this._ctx.arc(this._posX, this._posY, BUTTON_RADIUS, 0, Math.PI * 2, false);
        this._ctx.fill();
    };

    getSendVal(maxVal) {
        if (this._orientation == 'horizon') {
            return (Math.round((maxVal * 2) * (this._posX / this._canvas.width)) - maxVal);
        }
        if (this._orientation == 'virtical') {
            return (Math.round((maxVal * 2) * (this._posY / this._canvas.height)) - maxVal);
        }
    };

    onTouch() {
        return this._onTouch;
    };

    getStatus() {
        return (this._onTouch ? 1 : 0);
    };
}