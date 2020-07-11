
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();
  return this;
}

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
  
  this.leftEdge = 0;

  this.drawBlock = function(blockStacked, color) {
    blockSpacing = 12
    
    width = 8
    height = 8

    previewSpacing = 8

    previewWidth = 8
    previewHeight = 8

    for (i = 3; i<24; i++) {
      for (j = 0; j<12; j++) {
        if (blockStacked[i][j] == 0) {
          this.buffer.fillStyle = color;
          
        } else{
          this.buffer.fillStyle = this.colorTable[blockStacked[i][j]];
        }
        
        this.buffer.fillRect(Math.floor(this.leftEdge+80+j*blockSpacing), Math.floor(-4+i*blockSpacing), width, height);
      }
    }
    
  };
  this.drawCurrentTetromino = function(positions, color) {
    for (i=0; i<positions.length; i++){
      if (positions[i][1] <3) {
        continue;
      }
      this.buffer.fillStyle = color;
      this.buffer.fillRect(Math.floor(this.leftEdge+80+positions[i][0]*blockSpacing), Math.floor(-4+positions[i][1]*blockSpacing), width, height);
    }
  };
  this.drawPreview = function(sequence, blocks, color) {
    for (i=0; i<blocks.length; i++){
      this.buffer.fillStyle = color;
      this.buffer.fillRect(Math.floor(this.leftEdge+240+blocks[i][0]*previewSpacing), Math.floor(60+blocks[i][1]*previewSpacing) + sequence * 32, previewWidth, previewHeight);
    }
  };
  this.drawHold = function(blocks, color) {
    for (i=0; i<blocks.length; i++){
      this.buffer.fillStyle = color;
      this.buffer.fillRect(Math.floor(this.leftEdge+16+blocks[i][0]*blockSpacing), Math.floor(60+blocks[i][1]*blockSpacing), width, height);
    }
  };

  this.drawRectangle = function(x, y, width, height, color) {

    this.buffer.fillStyle = color;
    this.buffer.fillRect(Math.floor(x), Math.floor(y), width, height);

  };

  this.drawScore = function() {
    var gradient = this.buffer.createLinearGradient(300, 0, 400, 0);
    gradient.addColorStop("0"," magenta");
    gradient.addColorStop("0.5", "blue");
    gradient.addColorStop("1.0", "red");
    this.buffer.fillStyle = gradient;
    text = "Score: " + 
    this.buffer.fillText("Big smile!", 300, 50);
  };

  this.drawMouse = function(pos) {
    this.buffer.fillStyle = "#ffffff";
    this.buffer.fillRect(Math.floor(pos[0]), Math.floor(pos[1]), 10, 10);
  };

  this.drawButton = function(x, y, width, height, text) {
    this.buffer.fillStyle = "#ffffff";
    this.buffer.fillRect(Math.floor(x), Math.floor(y), width, height);
    this.buffer.fillRect(Math.floor(x), Math.floor(y-5), width, 2);
    this.buffer.fillRect(Math.floor(x), Math.floor(y+height+3), width, 2);

    var gradient = this.buffer.createLinearGradient(100, 0, 300, 0);
    gradient.addColorStop("0"," magenta");
    gradient.addColorStop("0.5", "blue");
    gradient.addColorStop("1.0", "red");
    this.buffer.fillStyle = gradient;
    this.buffer.font = "30px Verdana";
    this.buffer.fillText(text, x+120, y+height-17);
  };

  this.drawMenu = function() {
    this.buffer.fillStyle = "#5d5c61";
    // this.buffer.fillRect(Math.floor(330), Math.floor(-10), 30, 5);
    this.buffer.roundRect(330, -10, 100, 30, 5).fill();

    this.buffer.fillStyle = "#557a95";
    this.buffer.font = "14px FontAwesome";
    this.buffer.fillText("\uf013", 340, 15);

  };

  this.drawCountDown = function(count) {
    // the count start from 0 to 90
    this.buffer.fillStyle = "#ffe400";
    
    number = Math.ceil((90 - count) / 30);
    
    size = 40 - (count % 30 / 2)
    console.log("number", number, size)
    this.buffer.font = size + "px Verdana";
    this.buffer.fillText(number, 155-size/2, 150+size/2);
  };

  this.fill = function(color) {

    this.buffer.fillStyle = color;
    this.buffer.fillRect(0, 0, this.buffer.canvas.width, this.buffer.canvas.height);

  };

  this.render = function() {
     this.context.drawImage(this.buffer.canvas, 0, 0, this.buffer.canvas.width, this.buffer.canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height); };

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
