
const Display = function(canvas) {
  this.colorTable = {
    9: "#ffffff",     // edge
    1: "#66ffff",     // I
    2: "#ffff00",     // O
    3: "#ff00ff",     // T
    4: "#ff9900",     // J
    5: "#0000ff",     // L
    6: "#ff3300",     // S
    7: "#66ff33"      // Z
  }

  this.buffer  = document.createElement("canvas").getContext("2d"),
  this.context = canvas.getContext("2d");

  this.drawBlock = function(blockStacked, color) {
    width = 1
    height = 1

    previewWidth = 0.5
    previewHeight = 0.5

    for (i = 4; i<23; i++) {
      for (j = 0; j<12; j++) {
        if (blockStacked[i][j] == 0) {
          this.buffer.fillStyle = color;
          
        } else{
          this.buffer.fillStyle = this.colorTable[blockStacked[i][j]];
        }
        
        this.buffer.fillRect(Math.floor(20+j*2), Math.floor(10+i*2), width, height);
      }
    }
    
  };
  this.drawCurrentTetromino = function(positions, color) {
    for (i=0; i<positions.length; i++){
      this.buffer.fillStyle = color;
      this.buffer.fillRect(Math.floor(20+positions[i][0]*2), Math.floor(10+positions[i][1]*2), width, height);
    }
  };
  this.drawPreview = function(sequence, blocks, color) {
    for (i=0; i<blocks.length; i++){
      this.buffer.fillStyle = color;
      this.buffer.fillRect(Math.floor(50+blocks[i][0]*1.2), Math.floor(18+blocks[i][1]*1.2) + sequence * 8, previewWidth, previewHeight);
    }
  };

  this.drawRectangle = function(x, y, width, height, color) {

    this.buffer.fillStyle = color;
    this.buffer.fillRect(Math.floor(x), Math.floor(y), width, height);

  };

  this.fill = function(color) {

    this.buffer.fillStyle = color;
    this.buffer.fillRect(0, 0, this.buffer.canvas.width, this.buffer.canvas.height);

  };

  this.render = function() { this.context.drawImage(this.buffer.canvas, 0, 0, this.buffer.canvas.width, this.buffer.canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height); };

  this.resize = function(width, height, height_width_ratio) {

    if (height / width > height_width_ratio) {

      this.context.canvas.height = width * height_width_ratio;
      this.context.canvas.width = width;

    } else {

      this.context.canvas.height = height;
      this.context.canvas.width = height / height_width_ratio;

    }

    this.context.imageSmoothingEnabled = false;

  };

};

Display.prototype = {

  constructor : Display

};
