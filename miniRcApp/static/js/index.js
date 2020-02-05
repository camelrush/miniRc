$(document).ready(function() {

    $("#slider-bar-virtical").slider({
        orientation: 'vertical',
        animate: 'slow',
        value: 5,
        min: 0,
        max: 10,
        step: 1,
        range: "min",
        slide: function(event, ui) {
            $("#slider-value-virtical").html(ui.value - (10 / 2));
        }
    });

    $("#slider-bar-horizon").slider({
        orientation: 'horizon',
        animate: 'slow',
        value: 5,
        min: 0,
        max: 10,
        step: 1,
        range: "min",
        slide: function(event, ui) {
            $("#slider-value-horizon").html(ui.value - (10 / 2));
        }
    });
});