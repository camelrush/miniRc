$(document).ready(function() {

    $("#slider-bar-virtical").slider({
        orientation: 'vertical',
        animate: 'slow',
        value: 0,
        min: -5,
        max: 5,
        step: 1,
        range: "min",
        change: function(event, ui) {
            $("#slider-value-virtical").html(ui.value);
            control_send();
        }
    });

    $("#slider-bar-horizon").slider({
        orientation: 'horizon',
        animate: 'slow',
        value: 0,
        min: -5,
        max: 5,
        step: 1,
        range: "min",
        change: function(event, ui) {
            $("#slider-value-horizon").html(ui.value);
            control_send();
        }
    });

    $("#slider-arrow-up").click(function() {
        var val = $("#slider-bar-virtical").slider("value");
        $("#slider-bar-virtical").slider("value", val + 1);
    });

    $("#slider-arrow-down").click(function() {
        var val = $("#slider-bar-virtical").slider("value");
        $("#slider-bar-virtical").slider("value", val - 1);
    });

    $("#slider-arrow-left").click(function() {
        var val = $("#slider-bar-horizon").slider("value");
        $("#slider-bar-horizon").slider("value", val - 1);
    });

    $("#slider-arrow-right").click(function() {
        var val = $("#slider-bar-horizon").slider("value");
        $("#slider-bar-horizon").slider("value", val + 1);
    });

    var control_send = function() {

        var vval = $("#slider-bar-virtical").slider("value");
        var hval = $("#slider-bar-horizon").slider("value");

        var data = {
            direction: "left",
            virtical: vval,
            horizon: hval
        };

        $.ajax({
            type: "POST",
            url: "http://192.168.3.24:3000/control/",
            data: data,
            dataType: "html"
        }).done(function(data, textStatus, jqXHR) {
            alert(data);
        });
    };

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