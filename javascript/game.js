
const Game = function() {

  this.world = {

    blockStacked: [
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0]
    ],

    settings: {
      initPos: [4, 2],
      delayedAutoShift: 5,
      lockDelay: 10
  
    },
    

    background_color:"rgba(40,48,56,0.25)",

    friction:0.9,
    gravity:3,

    // player:new Game.Player(),
    previewQueue:new Game.PreviewQueue(),

    height:72,
    width:128,

    delayedCount: 0,

    currentTetromino: null,    // This value would be null when in spawn delay

    stage: 0,    // 0: for begining & init a new tetromino
                 // 1: normal drop 
                 // 2: tetromino has attached to the stack, in lock delay
                 // 3: clear delay
                 // 4: spawn delay
                 // Note that for 1,2 currentTetromino should not be null, 
                 // thus the tetromino can be control by key board
                 // the stage idea is not good

    ///////////////// KEYBOARD EVENTS ////////////////////
    /* TODO: Check if move thes event handlers to a single sub class */
    pressLeft:function(){

    },
    pressRight:function(){

    },


    //////////////// ROUTINE ///////////////////////
    drop:function(tetromino) {
      if (this.isCollide(tetromino))  {
        this.attachTetromino()
      } else {
        tetromino.pos[1] += 1
      }
      
    },
    isCollide:function(tetromino) {
      if (tetromino.pos[1] == this.blockStacked.length-1) {
        return true
      }

      blocks = this.currentTetromino.getBlocks()
      // console.log("collide", blocks)
      for (i=0; i<blocks.length; i++) {
        console.log("blocks[i]", blocks[i][1]+1, blocks[i][0])
        if (this.blockStacked[blocks[i][1]+1][blocks[i][0]] != 0) {
          return true
        }
        
      }
      return false
    },
    attachTetromino:function() {
      console.log("in attach function")
      this.stage = 2
      this.delayedCount = 0

      blocks = this.currentTetromino.getBlocks()
      for (i=0; i<blocks.length; i++) {
        console.log("blocks[i]", blocks[i])
        this.blockStacked[blocks[i][1]][blocks[i][0]] = this.currentTetromino.id
      }


    },
    initTetromino:function(position) {
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
    update:function() {

      if (this.stage == 0) {
        console.log("in stage 00000000 ~~")
        this.initTetromino(this.settings.initPos)
      } 
      else if (this.stage == 1){
        console.log("in stage 11111111 ~~")
        if (this.delayedCount > this.settings.delayedAutoShift){
          this.delayedCount = 0
          /* update keyboard event */
        
        
        
          /* update auto drop */
          this.drop(this.currentTetromino)
        }
        this.delayedCount++

      } else if (this.stage == 2){
        if (this.delayedCount > this.settings.lockDelay){
          this.stage = 0
          this.delayedCount = 0
        } else {
          this.delayedCount++
        }
      } else if (this.stage == 5){
        console.log("Good Game!")
      }

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
    items.push(1,2,3,4,5,6,7);
    console.log("push new array")
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

Game.Tetromino = function(teriminoId, position){
  this.initPosTable= {
    1: [[-1,0],[0,0],[1,0],[2,0]],       // I
    2: [[0,0],[0,-1],[1,0],[1,-1]],      // O
    3: [[-1,0],[0,-1],[0,0],[1,0]],      // T
    4: [[-1,0],[0,0],[1,-1],[1,0]],      // J
    5: [[-1,-1],[-1,0],[0,0],[1,0]],     // L
    6: [[-1,0],[0,-1],[0,0],[1,-1]],     // S
    7: [[-1,-1],[0,-1],[0,0],[1,0]]      // Z
  }

  this.colorTable = {
    1: "#66ffff",     // I
    2: "#ffff00",     // O
    3: "#ff00ff",     // T
    4: "#ff9900",     // J
    5: "#0000ff",     // L
    6: "#ff3300",     // S
    7: "#66ff33"      // Z
  }

  this.id = teriminoId

  this.initPos = this.initPosTable[teriminoId]
  console.log(this.initPos, teriminoId)
  this.color = this.colorTable[teriminoId]
  console.log("this.color", this.color)
  this.pos = [...position]
  
}

Game.Tetromino.prototype = {
  constructor : Game.Tetromino,

  // initPosTable: {
  //   0: [[0,0],[0,1],[1,0],[1,1]],     // O
  //   1: [[4,1],[5,1],[4,2],[5,2]],
  //   2: [[4,1],[5,1],[4,2],[5,2]],
  //   3: [[4,1],[5,1],[4,2],[5,2]],
  //   4: [[4,1],[5,1],[4,2],[5,2]],
  //   5: [[4,1],[5,1],[4,2],[5,2]],
  //   6: [[4,1],[5,1],[4,2],[5,2]]
  // },

  // colorTable: {
  //   0: "#ffff00",   // O
  //   1: "#ffff00",
  //   2: "#ffff00",
  //   3: "#ffff00",
  //   4: "#ffff00",
  //   5: "#ffff00",
  //   6: "#ffff00"
  // },

  // kickTable: {},
  getBlocks:function() {
    var res = [];
    pos_x = this.pos[0];
    pos_y = this.pos[1];
    for (i=0; i<4; i++) {
      relPos = this.initPos[i]
      
      res.push([pos_x+relPos[0], pos_y+relPos[1]])
    }
    return res;
  },
  getColor:function() {
    return  this.color
  }
}