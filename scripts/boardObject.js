//Game Board Constructor
function Board(boardSVGElement, numberOfPlayers) {
    //PROPERTIES
    this.boardSVGElement = boardSVGElement;
    //will contain all hexes on board
    this.hexMap = {};
    this.numPlayers = numberOfPlayers;
    //initialize following properties based on number of players
    switch(this.numPlayers) {
        case 2:
        this.totalRows = 9;
        this.initRowLength = 5; 
        //total number of hexes on board (NOT INCLUDING BORDER HEXES)
        this.numHexes = 37;
        break;
        case 3:
        this.totalRows = 11;
        this.initRowLength = 6; 
        //total number of hexes on board (NOT INCLUDING BORDER HEXES)
        this.numHexes = 61;
        break;
        case 4:
        this.totalRows = 13;
        this.initRowLength = 7; 
        //total number of hexes on board (NOT INCLUDING BORDER HEXES)
        this.numHexes = 91;
        break;
        case 5:
        case 6:
        case 7:
        case 8:
        this.totalRows = 15;
        this.initRowLength = 8; 
        //total number of hexes on board (NOT INCLUDING BORDER HEXES)
        this.numHexes = 127;
        break;
        default:
        //default to 2 players
        this.totalRows = 9;
        this.initRowLength = 5; 
        //total number of hexes on board (NOT INCLUDING BORDER HEXES)
        this.numHexes = 37;
    }
    //total pull of hexes for every board size (DOES NOT INCLUDE BOARDER HEXES!)
    this.totalPossibleHexes = 132;
    //x and y pos of first hex
    this.initialHex_XPos = 250;
    this.initialHex_YPos = 10;

    this.currentAmtWaterHexes = CONSTANTS.MAX_WATER_HEXES;
    this.currentAmtForestHexes = CONSTANTS.MAX_FOREST_HEXES;
    this.currentAmtGrassHexes = CONSTANTS.MAX_GRASS_HEXES;
    this.currentAmtPlainHexes = CONSTANTS.MAX_PLAIN_HEXES;
    this.currentAmtMountainHexes = CONSTANTS.MAX_MOUNTAIN_HEXES;
}

//TODO: Improve performance
Board.prototype.getDragoverHex = function(xPos, yPos) {
    for(var hex in this.hexMap) {
         if(Snap.path.isPointInside(hexMap[hex].svgElement, currentXPos, currentYPos)) {
            return hexMap[hex].svgElement;
         }
    }
    return null;
}

Board.prototype.getHex = function(xPos, yPos, zPos) {
    return this.hexMap[xPos.toString() + yPos.toString() + zPos.toString()];
}

Board.prototype.revealHexTerrainType = function() {
    //1d100
    var terrainType = CONSTANTS.BLANK_HEX_COLOR;
    var randomRoll = Math.floor(Math.random() * 100 + 1);
    //calculate percent chance of particular hex being chosen
    var chanceOfMountain = Math.floor((this.currentAmtMountainHexes / this.totalPossibleHexes) * 100);
    var chanceOfPlain = Math.floor((this.currentAmtPlainHexes / this.totalPossibleHexes) * 100);
    var chanceOfForest = Math.floor((this.currentAmtForestHexes / this.totalPossibleHexes) * 100);
    var chanceOfGrass = Math.floor((this.currentAmtGrassHexes / this.totalPossibleHexes) * 100);
    var chanceOfWater = Math.floor((this.currentAmtWaterHexes / this.totalPossibleHexes) * 100);
    //determine which range roll is in
    var mountainRange = randomRoll > 0 && randomRoll <= chanceOfMountain;
    var plainRange = randomRoll > chanceOfMountain && randomRoll <= (chanceOfMountain + chanceOfPlain);
    var forestRange = randomRoll > (chanceOfMountain + chanceOfPlain) 
        && randomRoll <= (chanceOfMountain + chanceOfPlain + chanceOfForest);
    var grassRange = randomRoll > (chanceOfMountain + chanceOfPlain + chanceOfForest)
        && randomRoll <= (chanceOfMountain + chanceOfPlain + chanceOfForest + chanceOfGrass);
    var waterRange = randomRoll > (chanceOfMountain + chanceOfPlain + chanceOfForest + chanceOfGrass)
        && randomRoll <= 100;
    //when a particular hex is chosen reduce that hex total by one
    if(mountainRange) {
        this.currentAmtMountainHexes--;
        terrainType = CONSTANTS.MOUNTAIN_HEX_COLOR;
    } else if(plainRange) {
        this.currentAmtPlainHexes--;
        terrainType = CONSTANTS.PLAIN_HEX_COLOR;
    } else if(forestRange) {
        this.currentAmtForestHexes--;
        terrainType = CONSTANTS.FOREST_HEX_COLOR;
    } else if(grassRange) {
        this.currentAmtGrassHexes--;
        terrainType = CONSTANTS.GRASS_HEX_COLOR;
    } else if(waterRange) {
        this.currentAmtWaterHexes--;
        terrainType = CONSTANTS.WATER_HEX_COLOR;
    } else {
        console.log("ERROR: revealHexTerrainType");
    }    
    //reduce total amount of all hexes by one
    this.totalPossibleHexes--;
    console.log("Random Roll: " + randomRoll + "\nTotal Amt of Hexes: " + this.totalPossibleHexes + 
    "\nChance/Range of Mountain: " + chanceOfMountain + "/" + mountainRange +
    "\nChance/Range of Forest: " + chanceOfForest + "/" + forestRange + 
    "\nChance/Range of Grassland: " + chanceOfGrass + "/" + grassRange +
    "\nChance/Range of Plain: " + chanceOfPlain + "/" + plainRange +
    "\nChance/Range of Water: " + chanceOfWater + "/" + waterRange);
    return terrainType;
}

Board.prototype.getHexCoordinates = function(hexRowIndex, hexIndex, rowLength) {
    var middleRow = Math.floor(this.totalRows / 2);
    var first_XPos = 0;
    var currentYPos = Math.floor(this.totalRows / 2) - hexRowIndex;
    var currentXPos = 0;
    var currentZPos = 0;
    //x and z calculations for first half of board
    if(hexRowIndex <= middleRow) {
        first_XPos = (rowLength - this.totalRows) - hexRowIndex;
        currentXPos = first_XPos + hexIndex;
    } else {
        first_XPos = -(rowLength - this.totalRows + middleRow);
        currentXPos = first_XPos + hexIndex;
    }
    currentZPos = -currentXPos - currentYPos;

    return [currentXPos, currentYPos, currentZPos];
}

Board.prototype.createHexSVGElement = function(terrainType, hexPathPos, xyzCoords, xPosition, yPosition, isOnBorder) {
    var svgHex = this.boardSVGElement.path(hexPathPos + CONSTANTS.HEX_PATH)
    .attr({
        fill: terrainType,
        stroke: CONSTANTS.DEFAULT_STROKE_COLOR,
        strokeWidth: CONSTANTS.DEFAULT_STROKE_WIDTH,
        class: "hex"
    })
    .data("data_svgXPos", xPosition)
    .data("data_svgYPos", yPosition)
    .data("data_isBorderHex", isOnBorder)
    .data("data_xPos", xyzCoords[0])
    .data("data_yPos", xyzCoords[1])
    .data("data_zPos", xyzCoords[2]);

    svgHex.data("data_hexCenterX", svgHex.getBBox().cx)
        .data("data_hexCenterY", svgHex.getBBox().cy);

    return svgHex;
}

Board.prototype.createHex = function(hex_XPos, hex_YPos, currentRowIndex, currentHexIndex, rowLength) {
    //calculate hexes starting position
    var hexPath_Pos = "M" + hex_XPos.toString() + "," + hex_YPos.toString();
    var isHexOnBorder = currentHexIndex == 0 || currentHexIndex == rowLength - 1
        || currentRowIndex == 0 || currentRowIndex == this.totalRows - 1;
    var hex_xyzCoords = this.getHexCoordinates(currentRowIndex, currentHexIndex, rowLength);
    //hook for random generation of hexes
    //var hexTerrainType = !isHexOnBorder ? this.revealHexTerrainType() : this.WATER_HEX_COLOR;
    var hexTerrainType = !isHexOnBorder ? CONSTANTS.BLANK_HEX_COLOR : CONSTANTS.WATER_HEX_COLOR;
    var hex_svgElement = this.createHexSVGElement(hexTerrainType, hexPath_Pos, hex_xyzCoords, hex_XPos, hex_YPos, isHexOnBorder);
    var hexKey = hex_xyzCoords[0].toString() + hex_xyzCoords[1].toString() + hex_xyzCoords[2].toString();
    this.hexMap[hexKey] = new Hex(hex_svgElement);
    //subscribe to events
}

Board.prototype.createHexRow = function(currentRowLength, currentRowIndex, currentXPos, currentYPos) {
    for(var currentHex = 0; currentHex < currentRowLength; currentHex++) {
        this.createHex(currentXPos, currentYPos, currentRowIndex, currentHex, currentRowLength);
        currentXPos += CONSTANTS.HEX_WIDTH;
    }   
}

Board.prototype.createBoard = function() {
    var currentRowLength = this.initRowLength;
    var currentX_Pos = this.initialHex_XPos;
    var currentY_Pos = this.initialHex_YPos;
    var middleRow = Math.floor(this.totalRows / 2);
    for(var currentRow = 0; currentRow < this.totalRows; currentRow++) {
        this.createHexRow(currentRowLength, currentRow, currentX_Pos, currentY_Pos);

        if(currentRow < middleRow) {
            currentRowLength++;
            currentX_Pos -= CONSTANTS.HEX_WIDTH / 2;
        } else {
            currentRowLength--;
            currentX_Pos += CONSTANTS.HEX_WIDTH / 2;
        }
        currentY_Pos += CONSTANTS.HEX_HEIGHT;
    }
}