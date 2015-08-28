
      var ColorPickerView = Backbone.View.extend({
        initialize: function(options){
          var options = options || {};
          this.options = options;
        },
        initialColorChangeComplete: false, //we want to ignore the first change event
        /*
         * Generic template
         */
        template: _.template(ColorPickerTemplateHTML),
        /*
         * Marionette event on render...can attach your own event here
         */
        render: function(){
          if(this.options.onRender) this.options.onRender(this);

          this.$el.html(this.template({}));

          return this;
        },
        /*
         * Remove the picker and fire a callback
         */
        closePicker: function(){
          if(this.tmp) this.tmp.remove();
          if(this.options.onClose) this.options.onClose(this);
        },
        /*
         * Adding controls to colorjoe (Done, revert)
         */
        _registerControls: function(){
          if(!colorjoe._extras['controls']) colorjoe.registerExtra('controls', function(extras, joe) {
            var controls = $('<div class="color-picker-controls"><a class="color-picker-done" href="#">Done</a><a class="color-picker-revert" href="#">Revert to Default Color</a></div>');
            joe.e.appendChild(controls[0]);
          });
        },
        /*
         * Controls for swapping between color modes
         */
        _registerColorControls: function(joe_){
          var selector = $('<select><option value="rgb">RGB</option><option value="cmyk">CMYK</option><option value="hex">HEX</option></select>');

          var colorSelectors = {
            rgb: '.colorFields:first',
            cmyk: '.colorFields:not(:first)',
            hex: '.hex'
          }

          selector.change(function(e){
            e.preventDefault();
            var val = $(this).val();

            for(var key in colorSelectors){
              if(key == val){
                joe_.find(colorSelectors[key]).show();
              } else {
                joe_.find(colorSelectors[key]).hide();
              }
            }
          });

          selector.insertAfter(joe_.find('.currentColorContainer'));

          //Only how RGB by default
          joe_.find(colorSelectors.cmyk).hide();
          joe_.find(colorSelectors.hex).hide();
        },
        /*
         * Fix positioning, min-width, z-index for joe
         */
        _registerDisplay: function(joe_, preHeight){ //preHeight is height before joe was registered
          joe_.css('min-width', '380px');

          //Make sure joe has the max z-index
          var maxZ = Math.max.apply(null, 
            $.map($('body *'), function(e,n) {
              if ($(e).css('position') != 'static')
                return parseInt($(e).css('z-index')) || 1;
          }));
          joe_.css('z-index', maxZ+1);

          //Vertical positioning
          var postHeight = $(document).height();     
          if(postHeight > preHeight){
            joe_.css('bottom', '0px');

            var y = joe_.offset().top;
            if(y < 0){
              joe_.css('bottom', y+'px');
            }
          } else {
            joe_.css('top', '0px');
          }

          //Horizontal positioning
          if(this.tmp.offset().left + joe_.width() > $(window).width()){
            joe_.css('right', '1em');
          }
        },
        /*
         * Global listeners for the document
         */
        globalListeners: function(){
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
              self.closePicker();
              $(document).off('click.offColorPicker');
            } 
          });
        },
        /*
         * Launch the picker
         */
        launch: function(launcher){
          this.closePicker();

          var self = this;

          self.launcher = self.launcher || launcher;
          self.tmp = $('<div></div>');
          self.tmp.css('position', 'absolute');
          self.el.appendChild(self.tmp[0]);

          var preHeight = $(document).height();
          self._registerControls();
          var joe = colorjoe.rgb(self.tmp[0], self.color, [
            'currentColor',
            ['fields', {space: 'RGB', limit: 100}],
            ['fields', {space: 'CMYKA', limit: 100}],
            'hex',
            'controls'
          ])
          .on('change', function(c) {
            self.launcher.css('background-color', c.hex());
            self.color = c.hex();

            if(self.options.onPickerChange && self.initialColorChangeComplete){
              self.options.onPickerChange(self.color);
            }

            if(!self.initialColorChangeComplete) self.initialColorChangeComplete = true;
          })
          .update();

          self.joe = joe;

          var joe_ = $(joe.e);
          
          //Z-index fix, vertical & horizontal positioning
          self._registerDisplay(joe_, preHeight);

          //Allow swapping between color edit modes
          self._registerColorControls(joe_);

          //Global listeners that destroy joe instance
          self.globalListeners();
        },
        /*
         * Click events to handle (interactions with the picker)
         */
        events: {
          'click .color-picker-launch': function(e){
            e.preventDefault();
            var self = this;

            if(!self.color) self.color = self.options.color;
            self.launch($(e.target));
            //Launch callback
            if(this.options.onLaunch) this.options.onLaunch(this);
          },
          'click .color-picker-done': function(e){
            e.preventDefault();
            var self = this;

            self.launcher.css('background-color', self.color);
            if(self.options.onChange) self.options.onChange(self.color);
            self.closePicker();
          },
          'click .color-picker-revert': function(e){
            e.preventDefault();
            var self = this;

            self.color = self.options.defaultColor;
            self.launcher.css('background-color', self.options.defaultColor);
            self.launch();
          }
        }
      });
