describe('color-picker', function(){
  var ColorPicker = window.ColorPickerComponent;

  var el = $('body');

  /*
   * Attach color picker to provided target element
   */
  describe('A new ColorPicker instance...', function(){
    it('should attach to the given element', function(){
      var cp = new ColorPicker({attachTo: el});
      console.log(el);
      expect(el.has(cp.el).length).toEqual(1);
      cp.remove();
      delete cp;
    })
  })

  /*
   * Make sure expected things happen after clicking launcher
   */ 
  describe('Clicking launcher should open color picker view and trigger events', function(){
    var callbackFired = false;
    var rendered = null;
    var colorChanged = false;
    var cp = null;

    beforeEach(function(done) {
      cp = new ColorPicker({
        attachTo: el,
        onRender: function(result){
          callbackFired = true;
          rendered = result;
        },
        onPickerChange: function(color){
          colorChanged = true;
        }
      });

      done();
    });

    it('Should fire onRender callback on render', function(done){
      expect(callbackFired).toEqual(true);
      done();
    });

    it('Should give div element in render', function(done){
      expect($(rendered).is('div')).toEqual(true);
      cp.remove();
      done();
    });

    it('Should find .colorPicker', function(done){
      cp.launcher.click();
      expect(el.find('.colorPicker').length).toEqual(1);
      cp.remove();
      done();
    });

    it('Should close on clicking done', function(done){
      $(cp.el).find('.color-picker-done').click();
      expect(el.find('.colorPicker').length).toEqual(0);
      cp.remove();
      done();
    });

    afterEach(function(){
      cp.remove();
      var callbackFired = false;
      var rendered = null;
      cp = null;
      colorChanged = false;
    });
  });
});
