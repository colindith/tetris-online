
const Game = function() {

  this.world = {
    settings: {
      height: 288,
      width: 432,
      ghostColor: "#7F8C8D",
      backgroundColor: "rgba(40,48,56,0.25)",
    },
    masterBox: new Game.Box(this),

    init: function() {
      this.masterBox.init();
    },
    update: function() {
      
      
      if (this.isTitlePage()) {

      } else if (this.isPlaying()) {
        this.masterBox.update();
      } else if (this.isGoodGamePage()){
        console.log("Good Game!")
      }
    },
    stage: 10,  // 1: playing stage
                // 5: good game
                // 10: title page
                // 11: count down
    
    // Stage Control
    isTitlePage: function() {
      return this.stage == 10;
    },
    isCountDown: function() {
      return this.stage == 11;
    },
    isPlaying: function() {
      return this.stage == 1;
    },
    isGoodGamePage: function() {
      return this.stage == 5;
    },


    restartGame: function() {
      this.stage = 1;
      this.masterBox.restartBox();
    },
    startGame: function() {
      this.stage = 1;
    },
    goodGameStage: function() {
      this.stage = 5;
    },

    mousePosition: [0, 0],

    title: new Game.Title(432, 288),
  };


  //////////////// Init Game ///////////////
  this.world.init(); 


  this.update = function() {
    this.world.update();
  };

  this.mouseClick = function(clientX, clientY) {
    // console.log(clientX, clientY)
    this.world.mousePosition = [clientX, clientY];
    if (this.world.isTitlePage()) {
      // game start title
      if (this.world.title.posInTitle([clientX, clientY])) {
        this.world.startGame();
      }
    } else if (this.world.isGoodGamePage()) {
      // good game title
      if (this.world.title.posInTitle([clientX, clientY])) {
        this.world.restartGame();
      }
    }
    
  };
  
  this.controlEnter = function() {
    if (this.world.isTitlePage()) {
      // game start title
      this.world.startGame();
    } else if (this.world.isGoodGamePage()) {
      // good game title
      this.world.restartGame();
    }
  };


  this.getWorldSettings = function() {
    return this.world.setting;
  };

};

Game.prototype = {
  constructor : Game,

};

Game.Box = function(gameObj) {
  this.blockStacked = null;
  this.gameObj = gameObj;

  this.settings = {
    initPos: [4, 2],   // This can be moved to world directly
    autoDropInterval: 7,
    autoRepeatDelay: 6,
    autoRepeatInterval: 1,
    rotateAutoRepeatDelay: 12,
    rotateAutoRepeatInterval: 8,
    softDropAutoRepeatDelay: 1,
    softDropAutoRepeatInterval: 1,
    hardDropAutoRepeatDelay: 8  ,
    hardDropAutoRepeatInterval: 8,
    lockDelay: 3,
    hardLockDelay: 8,
    lockTime: 0,
    blockFieldWidth: 12,
    blockFieldHeight: 23,
  };
  


  this.previewQueue = new Game.PreviewQueue();



  this.delayedCount = 0;
  this.lockDelayCount = 0,
  this.hardLockDelayCount = 0,

  this.holdEnabled = true,

  this.currentTetromino = null,    // This value would be null when in spawn delay
  this.currentHold = null,

  // Stage Control
  this.stage = 0,   // 0: for begining & init a new tetromino
                    // 1: normal drop 
                    // 2: tetromino has locked to the stack, in lock time
                    // 3: clear delay
                    // 4: spawn delay
                    // Note that for 1,2 currentTetromino should not be null, 
                    // thus the tetromino can be control by key board
                    // the stage idea is not good
                    // 9: others(the situation that world stage != 1)
  this.isNewTetrominoStage = function() {
    return this.stage == 0;
  }
  this.isNormalDropStage = function() {
    return this.stage == 1;
  }
  this.notNormalDropStage = function() {
    return this.stage != 1;
  }
  this.isInLockTimeStage = function() {
    return this.stage == 2;
  }
  this.isClearDelayStage = function() {
    return this.stage == 3;
  }
  this.isInSpawnDelayStage = function() {
    return this.stage == 4;
  }
  this.newTetrominoStage = function() {
    this.stage = 0;
  }

  ////////////////// Initialize /////////////////////
  this.init = function(){
    this.blockStacked = this.initBlockStacked();
  },
  this.initBlockStacked = function() {
    var res = [];
    for (var i=0; i<this.settings.blockFieldHeight; i++ ) {
      res.push([9,0,0,0,0,0,0,0,0,0,0,9])
    }
    for (var i=0; i<2; i++ ) {
      res.push([9,9,9,9,9,9,9,9,9,9,9,9])
    }
    return res;
  },


  ///////////////// KEYBOARD EVENTS ////////////////////
  /* TODO: Check if move thes event handlers to a single sub class */
  this.controlLeft = function(){
    if (this.notNormalDropStage()) return;
    if (this.isCollide(this.currentTetromino, [-1, 0])) {
      return;
    }
    this.currentTetromino.pos[0] -= 1
    if (this.lockDelayCount -= 0) {
      this.lockDelayCount =  0;
    }
  },
  this.controlRight = function(){
    if (this.notNormalDropStage()) return;
    if (this.isCollide(this.currentTetromino, [1, 0])) {
      return;
    }
    this.currentTetromino.pos[0] += 1
    if (this.lockDelayCount != 0) {
      this.lockDelayCount = 0;
    }
  },
  this.controlRotateRight = function(){
    if (this.notNormalDropStage()) return;
    kickArray = this.currentTetromino.getKickArray(1)
    var i = 0;
    while (i < 5){
      isCollide = this.isCollide(this.currentTetromino, kickArray[i], 1);
      if (!isCollide) {
        this.currentTetromino.rotateRight(kickArray[i]);
        if (this.lockDelayCount != 0) {
          this.lockDelayCount =  0;
        }
        return;
      }
      i++
    }
  },
  this.controlRotateLeft = function(){
    if (this.notNormalDropStage()) return;
    kickArray = this.currentTetromino.getKickArray(-1)
    var i = 0;
    while (i < 5){
      isCollide = this.isCollide(this.currentTetromino, kickArray[i], -1);
      if (!isCollide) {
        this.currentTetromino.rotateLeft(kickArray[i]);
        if (this.lockDelayCount != 0) {
          this.lockDelayCount = 0;
        }
        return;
      }
      i++
    }
  },
  this.controlSoftDrop = function(){
    if (this.notNormalDropStage()) return;
    
    // The following code is same to the drop function except the `hardLockDelayCount` and `lockDelayCount` relative code
    // Press the down key should not change the `hardLockDelayCount` and `lockDelayCount` value
    if (!this.isCollide(this.currentTetromino, [0, 1], 0))  {
      this.currentTetromino.pos[1] += 1;
    }

    if (this.lockDelayCount != 0) {
      this.lockDelayCount = 0;
    }
  },
  this.controlHardDrop = function(){
    if (this.notNormalDropStage()) return;
    this.currentTetromino.pos[1] += this.getHardDropShift();
    this.attachTetromino();
  },
  this.controlHold = function(){
    if (this.notNormalDropStage()) return;
    if (this.holdEnabled == false) return;
    if (this.currentHold == null) {
      this.currentHold = this.currentTetromino;
      this.initTetromino(this.settings.initPos)
    } else {
      var tmp = this.currentTetromino;
      this.initTetromino(this.settings.initPos, this.currentHold)
      this.currentHold = tmp;
    }
    this.holdEnabled = false;
  },


  //////////////// ROUTINE ///////////////////////
  this.drop = function(tetromino) {
    
    if (this.isCollide(tetromino, [0, 1], 0))  {
      this.lockDelayCount += 1;
      this.hardLockDelayCount += 1;
    } else {
      tetromino.pos[1] += 1;
      this.lockDelayCount = 0;
      this.hardLockDelayCount = 0;
    }
  },
  this.isCollide = function(tetromino, shift=[0, 0], rotate=0) {
    blocks = this.currentTetromino.getBlocks(shift, rotate)
    for (var i=0; i<blocks.length; i++) {
      if (this.blockStacked[blocks[i][1]][blocks[i][0]] != 0) {
        return true
      }
    }
    return false
  },
  this.attachTetromino = function() {
    this.stage = 2
    this.delayedCount = 0
    this.lockDelayCount = 0;

    blocks = this.currentTetromino.getBlocks();
    height1 = this.settings.blockFieldHeight;
    height2 = 0;
    for (var i=0; i<blocks.length; i++) {
      if (blocks[i][1] < height1) {
        height1 = blocks[i][1];
      } else if (blocks[i][1] > height2) {
        height2 = blocks[i][1];
      }
      this.blockStacked[blocks[i][1]][blocks[i][0]] = this.currentTetromino.id
    }
    this.currentTetromino = null;
    this.checkClear(height1, height2);
  },
  this.checkClear = function(height1, height2) {      // height2 should greater than height1
    var clearLineArray = [];
    for (var i=height1; i<=height2; i++) {
      var isClear = true;
      for (var j = 0; j<this.settings.blockFieldWidth; j++) {
        if (this.blockStacked[i][j] == 0) {
          isClear = false;
          break;
        } 
      }
      if (isClear) {
        clearLineArray.push(i);
      }
    }
    if (clearLineArray.length) {
      this.clearLine(clearLineArray);
    }
  },
  this.clearLine = function(clearLineArray) {
    newLineShift = 0;
    for (var i=this.settings.blockFieldHeight; i>4; i--){
      if (i == clearLineArray[clearLineArray.length - newLineShift - 1]){
        newLineShift++;
      } else {
        this.blockStacked[i+newLineShift] = [...this.blockStacked[i]];
      }
    } 
  },

  // Create new tetromino at the init position
  this.initTetromino = function(position, tetromino=null) {
    if (tetromino == null) {
      currentTetrominoId = this.previewQueue.pop()
      this.currentTetromino = new Game.Tetromino(currentTetrominoId, position)
    } else{
      // tetromino.pos = position;
      this.currentTetromino = tetromino;
      this.currentTetromino.pos = [...position];
      this.currentTetromino.direction = 0;
    }

    if (this.isCollide(this.currentTetromino)) {
      this.gameObj.world.goodGameStage()
      this.delayedCount = 0
    } else {
      this.stage = 1
      this.delayedCount = 0
    }

  },
  this.update = function() {
    if (this.isNewTetrominoStage()) {
      // this.previewQueue.pushNewTetrominos();
      this.initTetromino(this.settings.initPos)
      this.holdEnabled = true;
    } else if (this.isNormalDropStage()){
      if (this.delayedCount > this.settings.autoDropInterval){
        this.delayedCount = 0
        /* update keyboard event */
      
      
      
        /* update auto drop */
        this.drop(this.currentTetromino)
        if (this.lockDelayCount >= this.settings.lockDelay || this.hardLockDelayCount >= this.settings.hardLockDelay) {
          this.attachTetromino();
        }
      }
      this.delayedCount++
    } else if (this.isInLockTimeStage()){
      if (this.delayedCount > this.settings.lockTime){
        this.newTetrominoStage()
        this.delayedCount = 0
      } else {
        this.delayedCount++
      }
    }
  },


  ////////////// ghost piece //////////////
  this.getHardDropShift = function() {
    for (var downShift=1; downShift<this.settings.blockFieldHeight; downShift++) {
      if (this.isCollide(this.currentTetromino, [0, downShift])) {
        return downShift-1;
      }
    }
    console.error("No buttom for harddrop");
    return null;
  },
  this.getHardDropBlocks = function() {
    return this.currentTetromino.getBlocks([0, this.getHardDropShift()]);
  },


  //////////////// Hold ////////////////////
  this.getHoldBlocks = function() {
    return this.currentHold.rotatePosition[0];
  },
  this.getHoldColor = function() {
    return this.currentHold.color
  };

  this.restartBox = function() {        // This should be changed to restartBox. And also need to add a restartworld outside
    this.init();
    this.delayedCount = 0;
    this.lockDelayCount = 0;
    this.hardLockDelayCount = 0;

    this.holdEnabled = true;

    this.currentTetromino = null;
    this.currentHold = null;
    // Here redefine the parameter of world. This is no good.

    this.previewQueue.emptyItems();
  };

}
Game.Box.prototype = {
  constructor : Game.Box,

};

Game.PreviewQueue = function() {
  var items = [];
	this.pushNewTetrominos = function() {
    new_tetrominos = [1,2,3,4,5,6,7];
    for (let i = new_tetrominos.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [new_tetrominos[i], new_tetrominos[j]] = [new_tetrominos[j], new_tetrominos[i]];
    }
    items.push(...new_tetrominos);
    
	};
	this.pop = function() {
    if (items.length < 7) {
      this.pushNewTetrominos()
    }
    return items.shift();
  };
  this.previewDisplay = function() {
    if (items.length == 0) {
      return [];
    }
    res = [];
    for (var i=0; i<5; i++) {
      res.push({
        "blocks": Game.rotatePositionTable[items[i]][0],
        "color": Game.colorTable[items[i]]
      })
    }
    return res;
  };
  this.emptyItems = function() {
    items = [];
  }
}

Game.rotatePositionTable = {
  1: [                            // I
    [[0,1],[1,1],[2,1],[3,1]],
    [[2,0],[2,1],[2,2],[2,3]],
    [[0,2],[1,2],[2,2],[3,2]],
    [[1,0],[1,1],[1,2],[1,3]],
  ],
  2: [                            // O
    [[1,0],[1,1],[2,0],[2,1]],
    [[1,0],[1,1],[2,0],[2,1]],
    [[1,0],[1,1],[2,0],[2,1]],
    [[1,0],[1,1],[2,0],[2,1]],
  ],
  3: [                            // T
    [[0,1],[1,0],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[2,1]],
    [[0,1],[1,1],[1,2],[2,1]],
    [[0,1],[1,0],[1,1],[1,2]],
  ],
  4: [                            // J
    [[0,1],[1,1],[2,0],[2,1]],
    [[1,0],[1,1],[1,2],[2,2]],
    [[0,1],[0,2],[1,1],[2,1]],
    [[0,0],[1,0],[1,1],[1,2]],
  ],
  5: [                            // L
    [[0,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[2,0]],
    [[0,1],[1,1],[2,1],[2,2]],
    [[0,2],[1,0],[1,1],[1,2]],
  ],
  6: [                            // S
    [[0,1],[1,0],[1,1],[2,0]],
    [[1,0],[1,1],[2,1],[2,2]],
    [[0,2],[1,1],[1,2],[2,1]],
    [[0,0],[0,1],[1,1],[1,2]],
  ],
  7: [                            // Z
    [[0,0],[1,0],[1,1],[2,1]],
    [[1,1],[1,2],[2,0],[2,1]],
    [[0,1],[1,1],[1,2],[2,2]],
    [[0,1],[0,2],[1,0],[1,1]],
  ]
}

Game.collideEdgeTable = {
  1: [
    [1, 1, 0, 3],
    [0, 3, 2, 2],
    [2, 2, 0, 3],
    [0, 3, 1, 1],
  ],
  2: [
    [0, 1, 1, 2],
    [0, 1, 1, 2],
    [0, 1, 1, 2],
    [0, 1, 1, 2],
  ],
  3: [
    [0, 1, 0, 2],
    [0, 2, 1, 2],
    [1, 2, 0, 2],
    [0, 2, 0, 1],
  ],
  4: [
    [0, 1, 0, 2],
    [0, 2, 1, 2],
    [1, 2, 0, 2],
    [0, 2, 0, 1],
  ],
  5: [
    [0, 1, 0, 2],
    [0, 2, 1, 2],
    [1, 2, 0, 2],
    [0, 2, 0, 1],
  ],
  6: [
    [0, 1, 0, 2],
    [0, 2, 1, 2],
    [1, 2, 0, 2],
    [0, 2, 0, 1],
  ],
  7: [
    [0, 1, 0, 2],
    [0, 2, 1, 2],
    [1, 2, 0, 2],
    [0, 2, 0, 1],
  ],
}

Game.kickTable = {
  // 1: [
  //   [[0, 0], [-2, 0], [+1, 0], [-2, -1], [+1, +2]],
  //   [[0, 0], [-1, 0], [+2, 0], [-1, +2], [+2, -1]],
  //   [[0, 0], [+2, 0], [-1, 0], [+2, +1], [-1, -2]],
  //   [[0, 0], [+1, 0], [-2, 0], [+1, -2], [-2, +1]],
  // ],
  // 2: [
  //   [[0, 0], [-1, 0], [-1, +1], [0, -2], [-1, -2]],
  //   [[0, 0], [+1, 0], [+1, -1], [0, +2], [+1, +2]],
  //   [[0, 0], [+1, 0], [+1, +1], [0, -2], [+1, -2]],
  //   [[0, 0], [-1, 0], [-1, -1], [0, +2], [-1, +2]],
  // ]
  // Since we use reversed y corrdinate, we multiply the y axis with -1
  1: [
    [[0, 0], [-2, 0], [+1, 0], [-2, +1], [+1, -2]],
    [[0, 0], [-1, 0], [+2, 0], [-1, -2], [+2, +1]],
    [[0, 0], [+2, 0], [-1, 0], [+2, -1], [-1, +2]],
    [[0, 0], [+1, 0], [-2, 0], [+1, +2], [-2, -1]],
  ],
  2: [
    [[0, 0], [-1, 0], [-1, -1], [0, +2], [-1, +2]],
    [[0, 0], [+1, 0], [+1, +1], [0, -2], [+1, -2]],
    [[0, 0], [+1, 0], [+1, -1], [0, +2], [+1, +2]],
    [[0, 0], [-1, 0], [-1, +1], [0, -2], [-1, -2]],
  ]
}

Game.colorTable = {
  1: "#66ffff",     // I
  2: "#ffff00",     // O
  3: "#ff00ff",     // T
  4: "#ff9900",     // J
  5: "#0000ff",     // L
  6: "#66ff33",     // S
  7: "#ff3300"      // Z
}

Game.Tetromino = function(teriminoId, position){
  this.id = teriminoId

  this.rotatePosition = Game.rotatePositionTable[teriminoId]
  this.collideEdge = Game.collideEdgeTable[teriminoId]
  this.color = Game.colorTable[teriminoId]
  if (teriminoId == 1) {
    this.kick = Game.kickTable[1]
  } else {
    this.kick = Game.kickTable[2]
  }
  
  this.pos = [...position]
  
  this.direction = 0

}

Game.Tetromino.prototype = {
  constructor : Game.Tetromino,
  getBlocks: function(shift=[0, 0], rotate=0) {
    var res = [];
    pos_x = this.pos[0] + shift[0];
    pos_y = this.pos[1] + shift[1];
    for (i=0; i<4; i++) {
      relPos = this.rotatePosition[(this.direction+rotate+4)%4][i]
      
      res.push([pos_x+relPos[0], pos_y+relPos[1]])
    }
    return res;
  },
  getColor: function() {
    return  this.color
  },
  uppermostShift: function() {
    return 2 - this.collideEdge[this.direction%4][0]
  },
  uppermost: function(rotate=0, shift=[0, 0]) {
    return this.pos[1] + shift[1] + this.collideEdge[(this.direction+rotate+4)%4][0]
  },
  downmost: function(rotate=0, shift=[0, 0]) {
    return this.pos[1] + shift[1] + this.collideEdge[(this.direction+rotate+4)%4][1]
  },
  leftmost: function(rotate=0, shift=[0, 0]) {
    return this.pos[0] + shift[0] + this.collideEdge[(this.direction+rotate+4)%4][2]
  },
  rightmost: function(rotate=0, shift=[0, 0]) {
    return this.pos[0] + shift[0] + this.collideEdge[(this.direction+rotate+4)%4][3]
  },
  rotateRight: function(shift=[0, 0]) {
    this.direction = (this.direction+5)%4
    this.pos[0] += shift[0]
    this.pos[1] += shift[1]
  },
  rotateLeft: function(shift=[0, 0]) {
    this.direction = (this.direction+3)%4
    this.pos[0] += shift[0]
    this.pos[1] += shift[1]
  },
  getKickArray: function(rotate=1) {   // rotate must be 1 or -1
    kickIndex = (4 + this.direction + ((rotate-1)/2))%4
    var res = this.kick[kickIndex].map(function(val, index) { return [val[0]*rotate, val[1]*rotate]; })
    return res
  }
}

Game.Title = function(width, height) {
  this.gameStartRect = [0, 0.4 * height, width, 0.2 * height];
  this.gameStartText = "Game Start";

  this.goodGameRect = [0, 0.4 * height, width, 0.2 * height];
  this.goodGameText = "Good Game";

  this.posInTitle = function(pos) {
    if (pos[0] > this.gameStartRect[0] && pos[0] < this.gameStartRect[0] + this.gameStartRect[2] &&
        pos[1] > this.gameStartRect[1] && pos[1] < this.gameStartRect[1] + this.gameStartRect[3]) {
          return true;
    }
    return false;

  };
  // title 掛在game.world底下會拿不到game.world.width, height等，也不能控制game.stage
  // This is no good:(



}