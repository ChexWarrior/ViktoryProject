//various globals and settings for entire hex board
var _BoardSettings = {
    hexPath: "l 30,20 l0,36 l -30,20 l -30,-20 l 0,-36 l 30,-20",
    hexWidth: 62,
    hexHeight: 58,
    //initial x position of a first hex
    initXPos: 250,
    //initial y pos of first hex
    initYPos: 10,
    numPlayers: 0, 
    //length of first row of hex board
    initRowLength: 0,
    //total number of rows in board
    numRows: 0,
    //total number of hexs NOT INCLUDING BORDER HEXES
    numHexes: 0,
    //total amount of possible hexes NOT INCLUDING BORDER
    totalHexes: 132,
    //total amount of possible mountain hexes
    totalMountainHex: 24,
    //total amount of possible plain hexes
    totalPlainHex: 24,
    //total amount of possible grassland hexes
    totalGrassHex: 24,
    //total amount of possible forest hexes
    totalForestHex: 24,
    //total amount of possible water hexes
    totalWaterHex: 36,
    //current zoom of board
    currentZoom: 1,
    //our base Snap.SVG element
    boardSVGElement: null,
    //reveal hex container
    hexContainer: null,
    //min number of players
    MIN_AMT_PLAYERS: 2,
    //max amount of players
    MAX_AMT_PLAYERS: 8,
    //current turn of game
    turnIndex: 0
};
//globals and settings for units
var _UnitGlobals = {
    //integer representation of each unit type
    INFANTRY_TYPE : 1,
    CALVARY_TYPE: 2,
    ARTILLERY_TYPE: 3,
    FRIGATE_TYPE: 4,
    //each units move amt
    CALVARY_MOVE: 3,
    INFANTRY_MOVE: 2,
    ARTILLERY_MOVE: 2,
    FRIGATE_MOVE: 5
};
//will be array of hex objects
var _HexArray = []; 

$(document).ready(function() {
	var boardElement = Snap("#board");
    _BoardSettings.boardSVGElement = boardElement;
    attachDOMEvents();    
});

function clearBoard(boardProperties) {
    boardProperties.totalWaterHex = 24;
    boardProperties.totalForestHex = 24;
    boardProperties.totalGrassHex = 24;
    boardProperties.totalPlainHex = 24;
    boardProperties.totalMountainHex = 24;
    boardProperties.totalHexes = 132;
    boardProperties.currentHexIndex = 0;
    _HexArray = [];
    //remove hexes
    $(".hex").remove(); 
}

function initializeBoard(numPlayers, boardProperties) {
    numPlayers = parseInt(numPlayers, 10);
    numPlayers = numPlayers < boardProperties.MIN_AMT_PLAYERS 
                 ? boardProperties.MIN_AMT_PLAYERS : numPlayers;
    numPlayers = numPlayers > boardProperties.MAX_AMT_PLAYERS  
                 ? boardProperties.MAX_AMT_PLAYERS  : numPlayers;
    boardProperties.numPlayers = numPlayers;

    switch(numPlayers) {
        case 2:
            boardProperties.numRows = 9;
            boardProperties.initRowLength = 5;
            boardProperties.numHexes = 37;
        break;
        case 3:
            boardProperties.numRows = 11;
            boardProperties.initRowLength = 6;
            boardProperties.numHexes = 61;
        break;
        case 4:
            boardProperties.numRows = 13;
            boardProperties.initRowLength = 7;
            boardProperties.numHexes = 91;
        break;
        case 5:
        case 6:
        case 7:
        case 8:
            boardProperties.numRows = 15;
            boardProperties.initRowLength = 8;
            boardProperties.numHexes = 127;
        break;
        default:
            //default to 2 players
            boardProperties.numRows = 9;
            boardProperties.initRowLength = 5;
            boardProperties.numHexes = 37;
    }
}

function createBoard(numPlayers, boardProperties) {
    //clear board
    clearBoard(boardProperties);
    //change settings based on number of players
    initializeBoard(numPlayers, boardProperties);
    //capture board settings
    var xPos = boardProperties.initXPos;
    var yPos = boardProperties.initYPos;
    var hexWidth = boardProperties.hexWidth;
    var hexHeight = boardProperties.hexHeight;
    var numRows = boardProperties.numRows;
    var rowLength = boardProperties.initRowLength;
    var middleRow = Math.floor(boardProperties.numRows/2);
    //create board
    for(var currentRow = 0; currentRow < numRows; currentRow++) {
        createHexRow(xPos, yPos, rowLength, currentRow, numRows, boardProperties);
        //settings for first half of board
        if(currentRow < middleRow) {
            rowLength++;
            xPos -= hexWidth/2;
            yPos += hexHeight;
        //second half of board
        } else {
            rowLength--;
            xPos += hexWidth/2;
            yPos += hexHeight;
        }
        //reattach event handlers on board resize?
    }
    hexDragTest(_BoardSettings);
}

function createHexRow(xPos, yPos, rowLength, rowNum, numRows, boardProperties) {    
    var hexWidth = boardProperties.hexWidth; 
    //create each hex for row 
    for(var curHex = 0; curHex < rowLength; curHex++) {
        createHex(xPos, yPos, rowNum, rowLength, curHex, numRows, boardProperties);
        //move xPos by correct length for each hex
        xPos += hexWidth; 
    }
}

function createHex(xPos, yPos, rowNum, rowLength, curHexInRow, numRows, boardProperties) {
    //dragover test func
    var testFunc = function() {
        alert("DRAG!");
    };
    //calcuate move to of this hex's path
    var hPos = "M" + xPos.toString() + "," + yPos.toString(); 
    var hexPath = boardProperties.hexPath;
    //is current hex on border
    var isOnBorder = curHexInRow == 0 || curHexInRow == rowLength - 1 
                     || rowNum == 0 || rowNum == numRows - 1;
    //get hex x, y, z coordinates
    var xyzCoords = getHexCoordinates(rowNum, numRows, curHexInRow, rowLength);
    //get hex terrain type via random generation
    //var hexTerrainType = !isOnBorder ? getHexTerrainType(boardProperties) : "blue";
    //drag and drop, hexes initially blank
    var hexTerrainType = !isOnBorder ? "white" : "blue";
    //create hex path element
    var hexToDraw = boardProperties.boardSVGElement.path(hPos + hexPath)
        .attr({
            fill: hexTerrainType,
            stroke: "black",
            strokeWidth: 3,
            class: "hex"
        })
        .data("data_isBorderHex", isOnBorder)
        .data("data_xPos", xyzCoords[0])
        .data("data_yPos", xyzCoords[1])
        .data("data_zPos", xyzCoords[2]);

    //test drag over
    hexToDraw.drag.over = testFunc;

    //create hex object
    var arrayKey = xyzCoords[0].toString() + xyzCoords[1].toString() + xyzCoords[2].toString();
    //add hex object to array of hexes
    _HexArray[arrayKey] = new Hex(hexToDraw); 
    //attach events to hex element
    hexEventSuscriber(_HexArray[arrayKey], boardProperties, _HexArray); 
}    

function getHexTerrainType(boardProperties) {
    var hexColor = "white";
    var totalHexes = boardProperties.totalHexes;
    var randomRoll = Math.floor(Math.random() * 100 + 1); //1-100
    //calculate the percent chance of a particular hex being chosen
    var mtnChance = Math.floor((boardProperties.totalMountainHex / totalHexes) * 100);
    var plnChance = Math.floor((boardProperties.totalPlainHex / totalHexes) * 100);
    var fstChance = Math.floor((boardProperties.totalForestHex / totalHexes) * 100);
    var grsChance = Math.floor((boardProperties.totalGrassHex / totalHexes) * 100);
    var wtrChance = Math.floor((boardProperties.totalWaterHex / totalHexes) * 100);
    //determine which range roll is in
    var mtnRange = randomRoll > 0 && randomRoll <= mtnChance;
    var plnRange = randomRoll > mtnChance && randomRoll <= (mtnChance + plnChance);
    var fstRange = randomRoll > (mtnChance + plnChance) 
                   && randomRoll <= (mtnChance + plnChance + fstChance);
    var grsRange = randomRoll > (mtnChance + plnChance + fstChance) 
                    && randomRoll <= (mtnChance + plnChance + fstChance + grsChance);
    var wtrRange = randomRoll > (mtnChance + plnChance + fstChance + grsChance) 
                   && randomRoll <= 100;//randomRoll <= (mtnChance + plnChance + fstChance + grsChance + wtrChance);    
    //when a pariticular hex is chosen reduce its total amt by one
    if(mtnRange) {  
        boardProperties.totalMountainHex--;
        hexColor = "gray";
    } else if(plnRange) {
        boardProperties.totalPlainHex--;
        hexColor = "yellow";
    } else if(fstRange) {
        boardProperties.totalForestHex--;
        hexColor = "green";
    } else if(grsRange) {
        boardProperties.totalGrassHex--;
        hexColor = "greenyellow";
    } else if(wtrRange) {
        boardProperties.totalWaterHex--;
        hexColor = "blue";
    } else {
        //SOMETHING WENT WRONG!
        //we'll know there is an error if any hexes are white
    }
    //reduce total amt of hexes by one
    boardProperties.totalHexes--; 
    return hexColor;
}

function getHexCoordinates(rowNum, numRows, curHexInRow, rowLength) {
    var middleRow = Math.floor(numRows/2);
    var firstXPos = 0;
    //calculate this hexes x,y,z coordinates
    var curY = Math.floor(numRows / 2) - rowNum;
    var curX = 0;
    var curZ = 0;
    // x and z calculations for first half of board
    if(rowNum <= middleRow) {
        firstXPos = (rowLength - numRows) - rowNum;
        curX = firstXPos + curHexInRow;
        curZ = -curX - curY;
    // > 4 calculations must change for second half of board
    } else { 
        firstXPos = -(rowLength - numRows + middleRow);
        curX = firstXPos + curHexInRow;
        curZ = -curX - curY;
    }
    
    return [curX, curY, curZ];
}