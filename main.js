/*
 * Color Picker Component
 *
 * Options:
 * {
 *    attachTo: $('#el'), //The dom element you want to attach the picker to
 *    defaultColor: '#fff', //A default color for the picker (revert color)
 *    color: '#bbb', //A color to instantiate the picker with
 *    onRender: function(picker){},
 *    onLaunch: function(picker){},
 *    onClose: function(picker){},
 *    onChange: function(color){},
 *    onPickerChange: function(color){} //Picker value has changed, but user has not clicked "Done"
 * }
 */
(function (module) {
    if (typeof define === "function" && define.amd) {
        define(['jquery', 'colorjoe', 'onecolor', 'scale.fix'], function ($, colorjoe) { 
          console.log('colorjoe is', colorjoe);
          return module.component($, colorjoe); 
        });
    } else {
        window.ColorPickerComponent = module.component($, colorjoe);
    }
}({
  component: function($, colorjoe){

    return function(options){
      // Set options if not given
      if(!options) options = {}

      options.defaultColor = options.defaultColor || options.color || '#f00'

      options.color = options.color || options.defaultColor;

      var vars = {
        initialColorChangeComplete: false, //we want to ignore the first change event
        color: options.color || options.defaultColor,
      };

      /*
       * Keep track of elements
       */
      var els = {
        container: null,
        launcher: null,
        picker: null,
        joe: null,
        done: null,
        revert: null
      };

      /*
       * Create an element
       */
      var el = function(e){
        return document.createElement(e);
      }

      /*
       * Create a link
       */
      var a = function(text, classname){
        var l = el('a');
        l.innerHTML = text;
        l.href = '#';
        l.className = classname;
        return l;
      }

      /*
       * Get the height of the document
       */
      var docHeight = function(){
        var body = document.body,
            html = document.documentElement;

        return Math.max( body.scrollHeight, body.offsetHeight, 
                         html.clientHeight, html.scrollHeight, html.offsetHeight );
      }

      /*
       * Close the picker
       */ 
      var closePicker = function(){
        if(els.picker) els.picker.remove();
        if(options.onClose) options.onClose();
      }

      /*
       * Extra Controls
       */
      var registerControls = function(){
        if(!colorjoe._extras['controls']) colorjoe.registerExtra('controls', function(extras, joe) {
          var controls = el('div');
          controls.className = 'color-picker-controls';

          var done = a('Done', 'color-picker-done');
          $(done).click(function(e){
            e.preventDefault();
            $(els.launcher).css('background-color', vars.color);
            if(options.onChange) options.onChange(vars.color);
            closePicker();
          });

          var revert = a('Revert to Default', 'color-picker-revert');
          $(revert).click(function(e){
            e.preventDefault();
            console.log('default', options.defaultColor);
            $(els.launcher).css('background-color', options.defaultColor);
            vars.color = options.defaultColor;
            showPicker();
          });

          controls.appendChild(revert);
          controls.appendChild(done);

          if(joe) joe.e.appendChild(controls);
        });
      }

      /*
       * Register Picker controls
       */
      var registerColorControls = function($joe){
        var selector = el('select');
        var opts = ['rgb', 'cmyk', 'hex'];
        opts.map(function(o){
          var opt = el('option');
          opt.value = o;
          opt.innerHTML = o.toUpperCase();
          selector.appendChild(opt);
        });

        var colorSelectors = {
          rgb: '.colorFields:first',
          cmyk: '.colorFields:not(:first)',
          hex: '.hex'
        }

        $(selector).change(function(e){
          e.preventDefault();
          var val = $(this).val();

          for(var key in colorSelectors){
            if(key == val){
              $joe.find(colorSelectors[key]).show();
            } else {
              $joe.find(colorSelectors[key]).hide();
            }
          }
        });

        $(selector).insertAfter($joe.find('.currentColorContainer'));

        //Only how RGB by default
        $joe.find(colorSelectors.cmyk).hide();
        $joe.find(colorSelectors.hex).hide();
      }

      /*
      * Fix positioning, min-width, z-index for joe
      */
      var registerDisplay = function($joe, preHeight){ //preHeight is height before joe was registered
        $joe.css({'min-width': '380px'});

        //Make sure joe has the max z-index
        var maxZ = Math.max.apply(null, 
          $.map($('body *'), function(e,n) {
            if ($(e).css('position') != 'static')
              return parseInt($(e).css('z-index')) || 1;
        }));
        $joe.css('z-index', maxZ+1);

        //Vertical positioning
        var postHeight = $(document).height();     
        if(postHeight > preHeight){
          $joe.css('bottom', '0px');

          var y = $joe.offset().top;
          if(y < 0){
            $joe.css('bottom', y+'px');
          }
        } else {
          $joe.css('top', '0px');
        }

        //Horizontal positioning
        if($(els.container).offset().left + $joe.width() > $(window).width()){
          $joe.css('right', '1em');
        }
      };   

      /*
       * Global listeners for the document
       */
      var globalListeners = function(){
        var self = this;
        $(document).on('click.offColorPicker', function(e){
          var target = $(e.target);
          if(
            target.is('.colorPicker') 
            || target.is('.color-picker-launch') 
            || $('.colorPicker').has(target).length
            || target.is('.color-picker-done')
            || target.is('.color-picker-revert')
          ){
            return;
          } else {
            closePicker();
            $(document).off('click.offColorPicker');
          } 
        });
      };

      /*
       * Show picker
       */
      var showPicker = function(){
        closePicker();

        els.picker = el('div');
        $(els.picker).css({'position': 'absolute'});
        els.container.appendChild(els.picker);

        var preHeight = docHeight();
        registerControls();
        var joe = colorjoe.rgb(els.picker, vars.color, [
          'currentColor',
          ['fields', {space: 'RGB', limit: 100}],
          ['fields', {space: 'CMYKA', limit: 100}],
          'hex',
          'controls'
        ])
        .on('change', function(c) {
          $(els.launcher).css({'background-color': c.hex()});
          vars.color = c.hex();

          if(options.onPickerChange && vars.initialColorChangeComplete){
            options.onPickerChange(vars.color);
          }

          if(!vars.initialColorChangeComplete) vars.initialColorChangeComplete = true;
        })
        .update();

        var $joe = $(joe.e);

        //Z-index fix, vertical & horizontal positioning
        registerDisplay($joe, preHeight);

        //Allow swapping between color edit modes
        registerColorControls($joe);

        //Global listeners that destroy joe instance
        globalListeners($joe);
      }

      var events = {
        launcher: function(el){
          showPicker();
          if(options.onLaunch) options.onLaunch();
        }
      }

      /*
       * Creates color picker component and adds to page
       */
      var ColorPicker = function(){
        els.container = el('div');
        $(els.container).css({position: 'relative', display: 'inline-block'});

        els.launcher = el('div');
        els.launcher.className = 'color-picker-launch';
        $(els.launcher).on('click', events.launcher);

        els.container.appendChild(els.launcher);

        $(els.launcher).css({
          'background-color': options.color,
          'min-height': '2em',
          'min-width': '2em'
        });
       
        if(options.attachTo){
          if(options.attachTo instanceof $){
            options.attachTo.append(els.container);
          } else {
            options.attachTo.appendChild(els.container);
          }
        }
        if(options.onRender) options.onRender(els.container);

        /*
         * Direct access to el, launcher
         */
        return {
          el: els.container,
          launcher: els.launcher,
          remove: function(){
            els.container.remove();
          }
        }
      };

      return ColorPicker(options);
    }
  }
}));
