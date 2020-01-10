// Frank Poth 03/09/2018

/* The keyDownUp handler was moved to the main file. */

const Controller = function() {

  this.left  = new Controller.ButtonInput();
  this.right = new Controller.ButtonInput();
  this.up    = new Controller.ButtonInput();

  this.keyDownUp = function(type, key_code) {

    var isKeydown = (type == "keydown");
    switch(key_code) {

      case 37: this.left.getInput(isKeydown);  break;
      case 38: this.up.getInput(isKeydown);    break;
      case 39: this.right.getInput(isKeydown);

    }

  };

};

Controller.prototype = {

  constructor : Controller

};

Controller.ButtonInput = function() {

  this.active = false;
  this.down = false;
  this.delayCount = 0;
  this.inAutoShift = false;
  // this.inInterval = false;

};

Controller.ButtonInput.prototype = {

  constructor: Controller.ButtonInput,
  
  getInput: function(isKeydown) {
    // if (isKeydown && !this.down) {
    //   this.delayCount = 30
    //   this.active = isKeydown;
    // } else if (!isKeydown) {
    //   this.active = isKeydown;
    // } else {
    //   this.delayCount = 5
    // }

    if (this.down != isKeydown) this.active = isKeydown;
    this.down = isKeydown;

  }

};
