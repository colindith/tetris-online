
const Game = function() {

  this.world = {

    blockStacked: [
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,0,0,0,0,0,0,0,0,0,0,9],
      [9,9,9,9,9,9,9,9,9,9,9,9]
    ],

    settings: {
      initPos: [4, 2],
      autoDropInterval: 7,
      autoRepeatDelay: 6,
      autoRepeatInterval: 1,
      rotateAutoRepeatDelay: 6,
      rotateAutoRepeatInterval: 6,
      softDropAutoRepeatDelay: 1,
      softDropAutoRepeatInterval: 1,
      hardDropAutoRepeatDelay: 6,
      hardDropAutoRepeatInterval: 6,
      lockDelay: 4,
      hardLockDelay: 20,
      lockTime: 5,
      blockFieldWidth: 12,
      blockFieldHeight: 23,
      
      ghostColor: "#7F8C8D",
    },
    

    background_color:"rgba(40,48,56,0.25)",

    friction:0.9,
    gravity:3,

    previewQueue:new Game.PreviewQueue(),

    height:72,
    width:54,

    delayedCount: 0,
    lockDelayCount: 0,
    hardLockDelayCount: 0,

    currentTetromino: null,    // This value would be null when in spawn delay

    stage: 0,    // 0: for begining & init a new tetromino
                 // 1: normal drop 
                 // 2: tetromino has locked to the stack, in lock time
                 // 3: clear delay
                 // 4: spawn delay
                 // Note that for 1,2 currentTetromino should not be null, 
                 // thus the tetromino can be control by key board
                 // the stage idea is not good






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
      this.drop(this.currentTetromino);
    },
    controlHardDrop: function(){
      if (this.stage != 1) return;
      this.currentTetromino.pos[1] += this.getHardDropShift();
      this.attachTetromino();
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
        this.blockStacked[i] = this.blockStacked[i-newLineShift];
      } 
    },
    initTetromino: function(position) {
      currentTetrominoId = this.previewQueue.pop()
      this.currentTetromino = new Game.Tetromino(currentTetrominoId, position)
      if (this.isCollide(this.currentTetromino)) {
        this.stage = 5
        this.delayedCount = 0
      } else {
        this.stage = 1
        this.delayedCount = 0
      }

    },
    update: function() {

      if (this.stage == 0) {
        this.initTetromino(this.settings.initPos)
      } 
      else if (this.stage == 1){
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
    }
  };

  

  this.update = function() {
    this.world.update();
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
  this.preview = function() {
    return items
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
  6: "#ff3300",     // S
  7: "#66ff33"      // Z
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
    res = this.kick[kickIndex]
    res.map(function(x) { return x*rotate; })
    return res
  }
}