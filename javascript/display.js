
const Display = function(canvas) {
  this.colorTable = {
    9: "#ffffff",     // edge
    1: "#66ffff",     // I
    2: "#ffff00",     // O
    3: "#ff00ff",     // T
    4: "#ff9900",     // J
    5: "#0000ff",     // L
    6: "#66ff33",     // S
    7: "#ff3300"      // Z
  }

  this.buffer  = document.createElement("canvas").getContext("2d"),
  this.context = canvas.getContext("2d");

  this.drawBlock = function(blockStacked, color) {
    blockSpacing = 3
    
    width = 2
    height = 2

    previewSpacing = 2

    previewWidth = 2
    previewHeight = 2

    for (i = 4; i<24; i++) {
      for (j = 0; j<12; j++) {
        if (blockStacked[i][j] == 0) {
          this.buffer.fillStyle = color;
          
        } else{
          this.buffer.fillStyle = this.colorTable[blockStacked[i][j]];
        }
        
        this.buffer.fillRect(Math.floor(30+j*blockSpacing), Math.floor(-1+i*blockSpacing), width, height);
      }
    }
    
  };
  this.drawCurrentTetromino = function(positions, color) {
    for (i=0; i<positions.length; i++){
      this.buffer.fillStyle = color;
      this.buffer.fillRect(Math.floor(30+positions[i][0]*blockSpacing), Math.floor(-1+positions[i][1]*blockSpacing), width, height);
    }
  };
  this.drawPreview = function(sequence, blocks, color) {
    for (i=0; i<blocks.length; i++){
      this.buffer.fillStyle = color;
      this.buffer.fillRect(Math.floor(70+blocks[i][0]*previewSpacing), Math.floor(14+blocks[i][1]*previewSpacing) + sequence * 8, previewWidth, previewHeight);
    }
  };
  this.drawHold = function(blocks, color) {
    for (i=0; i<blocks.length; i++){
      this.buffer.fillStyle = color;
      this.buffer.fillRect(Math.floor(14+blocks[i][0]*blockSpacing), Math.floor(14+blocks[i][1]*blockSpacing), width, height);
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
