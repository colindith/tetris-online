
const Game = function() {

  this.world = {
    blockStacked: null,

    settings: {
      initPos: [4, 2],
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
      
      ghostColor: "#7F8C8D",
    },
    

    background_color:"rgba(40,48,56,0.25)",

    previewQueue:new Game.PreviewQueue(),

    height:288,
    width:432,

    delayedCount: 0,
    lockDelayCount: 0,
    hardLockDelayCount: 0,

    holdEnabled: true,

    currentTetromino: null,    // This value would be null when in spawn delay
    currentHold: null,

    stage: 10,   // 0: for begining & init a new tetromino
                 // 1: normal drop 
                 // 2: tetromino has locked to the stack, in lock time
                 // 3: clear delay
                 // 4: spawn delay
                 // Note that for 1,2 currentTetromino should not be null, 
                 // thus the tetromino can be control by key board
                 // the stage idea is not good
                 // 5: good game
                 // 10: title page
                 // 11: count down
    mousePosition: [0, 0],

    title: new Game.Title(432, 288),

    ////////////////// Initialize /////////////////////
    init: function(){
      this.blockStacked = this.initBlockStacked();
    },
    initBlockStacked: function() {
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
    controlLeft: function(){
      if (this.stage != 1) return;
      if (this.isCollide(this.currentTetromino, [-1, 0])) {
        return;
      }
      this.currentTetromino.pos[0] -= 1
      if (this.lockDelayCount -= 0) {
        this.lockDelayCount =  0;
      }
    },
    controlRight: function(){
      if (this.stage != 1) return;
      if (this.isCollide(this.currentTetromino, [1, 0])) {
        return;
      }
      this.currentTetromino.pos[0] += 1
      if (this.lockDelayCount != 0) {
        this.lockDelayCount = 0;
      }
    },
    controlRotateRight: function(){
      if (this.stage != 1) return;
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
    controlRotateLeft: function(){
      if (this.stage != 1) return;
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
    controlSoftDrop: function(){
      if (this.stage != 1) return;
      
      // The following code is same to the drop function except the `hardLockDelayCount` and `lockDelayCount` relative code
      // Press the down key should not change the `hardLockDelayCount` and `lockDelayCount` value
      if (!this.isCollide(this.currentTetromino, [0, 1], 0))  {
        this.currentTetromino.pos[1] += 1;
      }

      if (this.lockDelayCount != 0) {
        this.lockDelayCount = 0;
      }
    },
    controlHardDrop: function(){
      if (this.stage != 1) return;
      this.currentTetromino.pos[1] += this.getHardDropShift();
      this.attachTetromino();
    },
    controlHold: function(){
      if (this.stage != 1) return;
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
    drop: function(tetromino) {
      
      if (this.isCollide(tetromino, [0, 1], 0))  {
        this.lockDelayCount += 1;
        this.hardLockDelayCount += 1;
      } else {
        tetromino.pos[1] += 1;
        this.lockDelayCount = 0;
        this.hardLockDelayCount = 0;
      }
    },
    isCollide: function(tetromino, shift=[0, 0], rotate=0) {
      blocks = this.currentTetromino.getBlocks(shift, rotate)
      for (var i=0; i<blocks.length; i++) {
        if (this.blockStacked[blocks[i][1]][blocks[i][0]] != 0) {
          return true
        }
      }
      return false
    },
    attachTetromino: function() {
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
    checkClear: function(height1, height2) {      // height2 should greater than height1
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
    clearLine: function(clearLineArray) {
      newLineShift = 0;
      for (var i=this.settings.blockFieldHeight; i>4; i--){
        var j = i;
        while (j == clearLineArray[clearLineArray.length - newLineShift - 1]){
          newLineShift++;
          j--;
        }
        this.blockStacked[i] = [...this.blockStacked[i-newLineShift]];
      } 
    },
    initTetromino: function(position, tetromino=null) {
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
        this.stage = 5
        this.delayedCount = 0
      } else {
        this.stage = 1
        this.delayedCount = 0
      }

    },
    update: function() {

      if (this.stage == 10) {
        
      } else if (this.stage == 0) {
        // this.previewQueue.pushNewTetrominos();
        this.initTetromino(this.settings.initPos)
        this.holdEnabled = true;
      } else if (this.stage == 1){
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

      } else if (this.stage == 2){
        if (this.delayedCount > this.settings.lockTime){
          this.stage = 0
          this.delayedCount = 0
        } else {
          this.delayedCount++
        }
      } else if (this.stage == 5){
        console.log("Good Game!")
      }
    },


    ////////////// ghost piece //////////////
    getHardDropShift: function() {
      for (var downShift=1; downShift<this.settings.blockFieldHeight; downShift++) {
        if (this.isCollide(this.currentTetromino, [0, downShift])) {
          return downShift-1;
        }
      }
      console.error("No buttom for harddrop");
      return null;
    },
    getHardDropBlocks: function() {
      return this.currentTetromino.getBlocks([0, this.getHardDropShift()]);
    },


    //////////////// Hold ////////////////////
    getHoldBlocks: function() {
      return this.currentHold.rotatePosition[0];
    },
    getHoldColor: function() {
      return this.currentHold.color
    },

    restartWorld: function() {
      this.init();
      this.delayedCount = 0;
      this.lockDelayCount = 0;
      this.hardLockDelayCount = 0;
  
      this.holdEnabled = true;
  
      this.currentTetromino = null;
      this.currentHold = null;
      // Here redefine the parameter of world. This is no good.
    },
  };


  //////////////// Init Game ///////////////
  this.world.init(); 


  this.update = function() {
    this.world.update();
  };

  this.mouseClick = function(clientX, clientY) {
    // console.log(clientX, clientY)
    this.world.mousePosition = [clientX, clientY];
    if (this.world.stage == 10) {
      // game start title
      if (this.world.title.posInTitle([clientX, clientY])) {
        this.world.stage = 0;
      }
    } else if (this.world.stage == 5) {
      // good game title
      if (this.world.title.posInTitle([clientX, clientY])) {
        this.world.stage = 0;
        this.world.restartWorld();
      }
    }
    
  };
  
  this.controlEnter = function() {
    if (this.world.stage == 10) {
      // game start title
      this.world.stage = 0;
    } else if (this.world.stage == 5) {
      // good game title
      this.world.stage = 0;
      this.world.restartWorld();
    }
  };

};

Game.prototype = { constructor : Game };


Game.PreviewQueue = function() {
  var items = [];
	this.pushNewTetrominos = function() {
    // TODO: implement this method
    items.push(1,2,4,5,6,7,3);
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
  // console.log(width, height, this)
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