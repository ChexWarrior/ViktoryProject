//object containing global constants
var _CONSTANTS = {
    //path to create hex shape
    HEX_PATH: "l 30,20 l0,36 l -30,20 l -30,-20 l 0,-36 l 30,-20",
    HEX_WIDTH: 62,
    HEX_HEIGHT: 58,
    //total pull of hexes for every board size (DOES NOT INCLUDE BOARDER HEXES!)
    TOTAL_HEXES: 132,
    //amount of hexes revealed on first turn
    STARTING_HEX_DRAW: 5,
    MIN_AMT_PLAYERS : 2,
    MAX_AMT_PLAYERS: 8,
    MAX_WATER_HEXES: 24,
    MAX_FOREST_HEXES: 24,
    MAX_GRASS_HEXES: 24,
    MAX_PLAIN_HEXES: 24,
    MAX_MOUNTAIN_HEXES: 24,
    //hex colors
    BLANK_HEX_COLOR: "white",
    WATER_HEX_COLOR: "blue",
    GRASS_HEX_COLOR: "greenyellow",
    FOREST_HEX_COLOR: "green",
    MOUNTAIN_HEX_COLOR: "gray",
    PLAIN_HEX_COLOR: "yellow"
};

//Game Board Constructor
function Board(boardSVGElement, constants, numberOfPlayers) {
    this.boardSVGElement = boardSVGElement;
    //will contain all hexes on board
    this.hexMap = {};
    this.numPlayers = numberOfPlayers;
    //initialize based on number of players
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
    //x and y pos of first hex
    this.initialHex_XPos = 250;
    this.initialHex_YPos = 10;
    this.currentAmtWaterHexes = constants.MAX_WATER_HEXES;
    this.currentAmtForestHexes = constants.MAX_FOREST_HEXES;
    this.currentAmtGrassHexes = constants.MAX_GRASS_HEXES;
    this.currentAmtPlainHexes = constants.MAX_PLAIN_HEXES;
    this.currentAmtMountainHexes = constants.MAX_MOUNTAIN_HEXES;
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

Board.prototype.createHexSVGElement = function(constants, terrainType, hexPathPos, xyzCoords, xPosition, yPosition, isOnBorder) {
    var svgHex = this.boardSVGElement.path(hexPathPos + constants.HEX_PATH)
    .attr({
        fill: terrainType,
        stroke: "black",
        strokeWidth: 3,
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

Board.prototype.createHex = function(constants, hex_XPos, hex_YPos, currentRowIndex, currentHexIndex, rowLength) {
    //calculate hexes starting position
    var hexPath_Pos = "M" + hex_XPos.toString() + "," + hex_YPos.toString();
    var isHexOnBorder = currentHexIndex == 0 || currentHexIndex == rowLength - 1
        || currentRowIndex == 0 || currentRowIndex == this.totalRows - 1;
    var hex_xyzCoords = this.getHexCoordinates(currentRowIndex, currentHexIndex, rowLength);
    //hook for random generation of hexes
    var hexTerrainType = !isHexOnBorder ? constants.BLANK_HEX_COLOR : constants.WATER_HEX_COLOR;
    var hex_svgElement = this.createHexSVGElement(constants, hexTerrainType, hexPath_Pos,
        hex_xyzCoords, hex_XPos, hex_YPos, isHexOnBorder);
    var hexKey = hex_xyzCoords[0].toString() + hex_xyzCoords[1].toString() + hex_xyzCoords[2].toString();
    this.hexMap[hexKey] = new Hex(hex_svgElement);
    //subscribe to events
}

Board.prototype.createHexRow = function(constants, currentRowLength, currentRowIndex, currentXPos, currentYPos) {
    for(var currentHex = 0; currentHex < currentRowLength; currentHex++) {
        this.createHex(constants, currentXPos, currentYPos, currentRowIndex, currentHex, currentRowLength);
        currentXPos += constants.HEX_WIDTH;
    }   
}

Board.prototype.createBoard = function(constants) {
    var currentRowLength = this.initRowLength;
    var currentX_Pos = this.initialHex_XPos;
    var currentY_Pos = this.initialHex_YPos;
    var middleRow = Math.floor(this.totalRows / 2);
    for(var currentRow = 0; currentRow < this.totalRows; currentRow++) {
        this.createHexRow(constants, currentRowLength, currentRow, currentX_Pos, currentY_Pos);

        if(currentRow < middleRow) {
            currentRowLength++;
            currentX_Pos -= constants.HEX_WIDTH/ 2;
        } else {
            currentRowLength--;
            currentX_Pos += constants.HEX_WIDTH / 2;
        }
        currentY_Pos += constants.HEX_HEIGHT;
    }
}


//Hex Constructor
function Hex(svgElement) {
    //PROPERTIES
    //current turn
    this.turn = 0;
    //ref to snap.svg element of hex
    this.svgElement = svgElement;
    //been revealed?
    this.hidden = true; 
    //battle fought on this hex this turn?
    this.hadBattle = false; 
    this.isMetropolis = false;
    this.terrainType = null;
    //causes cannons and infantry to stop when moving in
    this.slowTerrain = false;
    //array of units present on this hex
    this.units = [];
    //city, town or metropolis?
    this.structure = null; 
    //who controls this hex
    this.player = null;
    //is a starting hex initial hex
    this.initial = false;
    //METHODS
}

//Unit Constructor
function Unit(unitType, svgElement, homeHexIndex) {
    //PROPERTIES
    //Infantry, Calvary, Artillery or Frigate
    this.unitType = unitType;
    //unit type specific props
    switch(unitType) {
        case _UnitGlobals.CALVARY_TYPE:
            //number of spaces unit can move each turn
            this.move = _UnitGlobals.CALVARY_MOVE;
        break;
        case _UnitGlobals.INFANTRY_TYPE:
            this.move = _UnitGlobals.INFANTRY_MOVE;
        break;
        case _UnitGlobals.ARTILLERY_TYPE:
            this.move = _UnitGlobals.ARTILLERY_MOVE;
        break;
        case _UnitGlobals.FRIGATE_TYPE:
            this.move = _UnitGlobals.FRIGATE_MOVE;
        break;
    }
    //ref to unit svg element
    this.svgElement = svgElement;
    //which player controls this unit
    this.player = null;
    //is unit in reserve
    this.inReserve = true;
    //is this unit done moving/attacking
    this.turnDone = false;
    //is this unit about to attack
    this.battleStart = false;
    //hex that this unit is attached to
    this.homeHexIndex = homeHexIndex;
    //METHODS
}