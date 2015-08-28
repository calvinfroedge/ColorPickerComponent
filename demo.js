requirejs.config({
  paths: {
    "jquery": "https://cdnjs.cloudflare.com/ajax/libs/jquery/1.10.2/jquery.min",
    "onecolor": "./bower_components/color/one-color-all",
    "scale.fix": "./bower_components/colorjoe/js/scale.fix",
    "colorjoe": "./bower_components/colorjoe/dist/colorjoe",
    "css": "https://cdnjs.cloudflare.com/ajax/libs/require-css/0.1.8/css.min"
  }
});

define(["main", "css!./bower_components/colorjoe/css/colorjoe"], function(ColorPicker) {
  new ColorPicker({attachTo: $('#container')[0]});
  console.log('color picker is', ColorPicker);
});
