
window.addEventListener("load", function(event) {

  "use strict";

      ///////////////////
    //// FUNCTIONS ////
  ///////////////////

  /* This used to be in the Controller class, but I moved it out to the main file.
  The reason being that later on in development I might need to do something with
  display or processing directly on an input event in addition to updating the controller.
  To prevent referencing those components inside of my controller logic, I moved
  all of my event handlers here, to the main file. */
  var keyDownUp = function(event) {

    controller.keyDownUp(event.type, event.keyCode);

  };

  var mouseClick = function(event) {
    var canvas = document.querySelector("canvas")
    var rect = canvas.getBoundingClientRect();
    controller.mouseClick(
      event.type, 
      (event.clientX - rect.left) * game.world.settings.width / canvas.width, 
      (event.clientY - rect.top) * game.world.settings.width / canvas.width, 
      game)
  }

  /* I also moved this handler out of Display since part 1 of this series. The reason
  being that I need to reference game as well as display to resize the canvas according
  to the dimensions of the game world. I don't want to reference game inside of my
  Display class, so I moved the resize method into the main file. */
  var resize = function(event) {

    display.resize(document.documentElement.clientWidth - 32, document.documentElement.clientHeight - 32, game.world.settings.height / game.world.settings.width);
    display.render();

  };

  var render = function() {
    display.fill("rgba(255,0,0,0.25)");
    display.fill(game.world.settings.backgroundColor);// Clear background to game's background color.
    // display.drawRectangle(game.world.player.x, game.world.player.y, game.world.player.width, game.world.player.height, game.world.player.color);
    display.drawBlock(game.world.masterBox.blockStacked, "#000000");
    if (game.world.masterBox.currentTetromino != null) {
      display.drawCurrentTetromino(game.world.masterBox.getHardDropBlocks(), game.world.settings.ghostColor);
      display.drawCurrentTetromino(game.world.masterBox.currentTetromino.getBlocks(), game.world.masterBox.currentTetromino.getColor());
    }
    if (game.world.masterBox.previewQueue){
      var previewSquence = game.world.masterBox.previewQueue.previewDisplay();
      for (var i=0;i<previewSquence.length; i++){
        display.drawPreview(i, previewSquence[i].blocks, previewSquence[i].color)
      }
    }
    if (game.world.masterBox.currentHold){
      display.drawHold(game.world.masterBox.getHoldBlocks(), game.world.masterBox.getHoldColor())
    }
    // display.drawScore();
    // display.drawMouse(game.world.mousePosition);

    if (game.world.isTitlePage()) {
      display.drawButton(...game.world.title.gameStartRect, game.world.title.gameStartText)
    } else if (game.world.isGoodGamePage()) {
      display.drawButton(...game.world.title.goodGameRect, game.world.title.goodGameText)
    } else if (game.world.isCountDown()) {
      display.drawCountDown(game.world.countDown);
    }

    // display.drawMenu()

    display.render();
  };

  var update = function() {
    controller.autoRepeat(controller.left,
                          game.world.masterBox.controlLeft,
                          game.world.masterBox,
                          game.world.masterBox.settings.autoRepeatDelay,
                          game.world.masterBox.settings.autoRepeatInterval)
                          
    controller.autoRepeat(controller.right,
                          game.world.masterBox.controlRight,
                          game.world.masterBox,
                          game.world.masterBox.settings.autoRepeatDelay,
                          game.world.masterBox.settings.autoRepeatInterval)
                          
    controller.autoRepeat(controller.up,
                          game.world.masterBox.controlRotateRight,
                          game.world.masterBox,
                          game.world.masterBox.settings.rotateAutoRepeatDelay,
                          game.world.masterBox.settings.rotateAutoRepeatInterval)

    controller.autoRepeat(controller.z,
                          game.world.masterBox.controlRotateLeft,
                          game.world.masterBox,
                          game.world.masterBox.settings.rotateAutoRepeatDelay,
                          game.world.masterBox.settings.rotateAutoRepeatInterval)
    
    controller.autoRepeat(controller.down,
                          game.world.masterBox.controlSoftDrop,
                          game.world.masterBox,
                          game.world.masterBox.settings.softDropAutoRepeatDelay,
                          game.world.masterBox.settings.softDropAutoRepeatInterval)

    controller.autoRepeat(controller.space,
                          game.world.masterBox.controlHardDrop,
                          game.world.masterBox,
                          game.world.masterBox.settings.hardDropAutoRepeatDelay,
                          game.world.masterBox.settings.hardDropAutoRepeatInterval)

    controller.autoRepeat(controller.shift,
                          game.world.masterBox.controlHold,
                          game.world.masterBox,
                          99999,
                          99999)
    
    if (controller.enter.active) {
      game.controlEnter();
    }

    game.update();
    
  };

      /////////////////
    //// OBJECTS ////
  /////////////////

  var controller = new Controller();
  var display    = new Display(document.querySelector("canvas"));
  var game       = new Game();
  var engine     = new Engine(1000/30, render, update);

      ////////////////////
    //// INITIALIZE ////
  ////////////////////

  /* This is very important. The buffer canvas must be pixel for pixel the same
  size as the world dimensions to properly scale the graphics. All the game knows
  are player location and world dimensions. We have to tell the display to match them. */
  display.buffer.canvas.height = game.world.settings.height;
  display.buffer.canvas.width = game.world.settings.width;

  window.addEventListener("keydown", keyDownUp);
  window.addEventListener("keyup",   keyDownUp);
  window.addEventListener("resize",  resize);
  document.querySelector("canvas").addEventListener('click', mouseClick);

  resize();

  engine.start();

});
