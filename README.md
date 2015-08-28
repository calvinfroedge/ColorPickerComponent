# Color Picker Component

A framework agnostic color picker component. Based on ColorJoe (https://github.com/bebraw/colorjoe) as underlying color picker, with some extra controls and an added event API. 

Can be attached to any DOM element, and can be easily be hooked up to notify models of changes. 

Usage example: 

```
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
  new ColorPicker({attachTo: $('#container')});
});
```

Options:
 - attachTo: $('#el'), //The dom element you want to attach the picker to
 - defaultColor: '#fff', //A default color for the picker (revert color)
 - color: '#bbb', //A color to instantiate the picker with
 - onRender: function(picker){},
 - onLaunch: function(picker){},
 - onClose: function(picker){},
 - onChange: function(color){}

# Tests

To run tests, open test.html in a browser or run test.spec.js through jasmine cli.
