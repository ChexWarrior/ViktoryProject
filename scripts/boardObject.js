//Game Board Constructor
function Board(boardSVGElement, numberOfPlayers) {
    //PROPERTIES
    this.boardSVGElement = boardSVGElement;
    this.currentRound = 0;
    this.currentPlayerTurn = 0;
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
         if(Snap.path.isPointInside(this.hexMap[hex].svgElement, xPos, yPos)) {
            return this.hexMap[hex].svgElement;
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

Board.prototype.createHexSVGElement = function(terrainType, hexPathPos, xyzCoords, xPosition, yPosition, isOnBorder, cssClass) {
    var svgHex = this.boardSVGElement.path(hexPathPos + CONSTANTS.HEX_PATH)
    .attr({
        fill: terrainType,
        stroke: CONSTANTS.DEFAULT_STROKE_COLOR,
        strokeWidth: CONSTANTS.DEFAULT_STROKE_WIDTH,
        class: cssClass
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
    var hex_svgElement = this.createHexSVGElement(hexTerrainType, hexPath_Pos, hex_xyzCoords, hex_XPos, hex_YPos, isHexOnBorder,"hex");
    var hexKey = hex_xyzCoords[0].toString() + hex_xyzCoords[1].toString() + hex_xyzCoords[2].toString();
    var newHex = new Hex(hex_svgElement);
    this.subscribeHexEvents(newHex.svgElement);
    this.hexMap[hexKey] = newHex;

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

Board.prototype.processTurn = function() {
    if(this.currentRound == 0) {
        this.processFirstRound();
    } else {
        console.log("Not implemented yet...");
    }
}

Board.prototype.createHexContainer = function(numberOfHexesToDraw) {
    var hexWidth = CONSTANTS.HEX_WIDTH;
    var hexHeight = CONSTANTS.HEX_HEIGHT;
    var centerXPosOfBoard = this.boardSVGElement.getBBox().cx;
    var hexContainerPadding = 10;
    var hexContainerWidth = (hexWidth * numberOfHexesToDraw) + (hexContainerPadding * numberOfHexesToDraw);
    var hexContainerTopLeftX = Math.abs(centerXPosOfBoard - hexContainerWidth / 2);
    var hexContainerHeight = hexHeight + (hexContainerPadding * 2.5);
    var hexContainerTopLeftY = this.boardSVGElement.getBBox().cy - hexHeight;
    var hexContainer = this.boardSVGElement.rect(hexContainerTopLeftX, hexContainerTopLeftY, hexContainerWidth,
        hexContainerHeight, 10).attr({
            fill: CONSTANTS.BLANK_HEX_COLOR,
            stroke: CONSTANTS.DEFAULT_STROKE_COLOR,
            strokeWidth: CONSTANTS.DEFAULT_STROKE_WIDTH,
            class: "hexContainer"
        });

    return hexContainer;
}

Board.prototype.createHexesToDrag = function(hexContainer, numberOfHexesToDraw) {
    var hexPadding = 10;
    var hexWidth = CONSTANTS.HEX_WIDTH;
    var hexHeight = CONSTANTS.HEX_HEIGHT;
    var hexStartingPosX = hexContainer.getBBox().x + (hexWidth / 2) + hexPadding;
    var hexStartingPosY = hexContainer.getBBox().y + 3;
    var terrainType = "";
    var hexStartingPos = "";
    var newHex = null;

    for(var hexIndex = 0; hexIndex < numberOfHexesToDraw; hexIndex++) {
        terrainType = this.revealHexTerrainType();
        hexStartingPos = "M" + hexStartingPosX + "," + hexStartingPosY;
        newHex = this.createHexSVGElement(terrainType, hexStartingPos, [0,0,0],"","", false, "hexToDrag");
        hexStartingPosX += hexWidth + (hexPadding / 2);
        this.subscribeHexDrag(newHex);
        //dragHexEventSubscriber(dragHex);
    }    
}

Board.prototype.displayHexChoices = function(numberOfHexesToDraw) {
    var hexContainer = this.createHexContainer(numberOfHexesToDraw);
    this.createHexesToDrag(hexContainer, numberOfHexesToDraw);

}

Board.prototype.processFirstRound = function() {
    this.displayHexChoices(CONSTANTS.INITIAL_HEX_DRAW);
}

Board.prototype.subscribeHexEvents = function(hexSvgElement) {    
   this.subscribeHexMouseover(hexSvgElement);
   this.subscribeHexMouseout(hexSvgElement);
   //this.subscribeHexDrag(hexSvgElement);
}

Board.prototype.subscribeHexMouseover = function(hexSvgElement) {
    hexSvgElement.mouseover(function() {
        this.attr({
            stroke: CONSTANTS.MOUSE_OVER_STROKE_COLOR
        });
    });
}

Board.prototype.subscribeHexMouseout = function(hexSvgElement) {
     hexSvgElement.mouseout(function() {
        this.attr({
            stroke: CONSTANTS.DEFAULT_STROKE_COLOR
        });
    });
}

Board.prototype.subscribeHexDrag = function(hexSvgElement) {
    var boardObject = this;
    var moveFunc = function(dx, dy, posx, posy) {
        //get the last position this element was dragged to (origX, origY)
        var origX = this.data("origX") == null ? 0 : this.data("origX");
        var origY = this.data("origY") == null ? 0 : this.data("origY");
        dx = dx + origX;
        dy = dy + origY;
        //store the position were moving it to now (lastX, lastY)
        this.data("lastX", dx);
        this.data("lastY", dy);
        //actually move the hex...
        this.transform("t" + dx + "," + dy);
    };
    var startFunc = function(x, y) {
        console.log("MOVE START");
        this.attr({
            class: "movingHex"
        });
        $(".hexToDrag, .hexContainer").hide();
    };
    var endFunc = function(e) {
        console.log("MOVE END");
        var origHexCenterX = this.data("data_hexCenterX");
        var origHexCenterY = this.data("data_hexCenterY");
        //console.clear();
        //console.log("Orig center x pos: " + origHexCenterX  + " Orig center y pos: " + origHexCenterY);
        //store the new center of the dragged hex...
        var newHexCenterX = this.getBBox().cx;
        var newHexCenterY = this.getBBox().cy;
        //console.log("New center x pos: " + newHexCenterX + " New center y pos: " + newHexCenterY);
        //find which hex we dragged this hex over...
        var targetHex = boardObject.getDragoverHex(newHexCenterX, newHexCenterY);
        if(targetHex != null) {
            var targetHexObject = boardObject.hexMap[targetHex.data("data_xPos").toString() + targetHex.data("data_yPos").toString() +
                targetHex.data("data_zPos").toString()];
        }
        if(targetHex != null 
           // && (targetHexObject.initial && targetHexObject.player == 1)
            && targetHexObject.hidden) {
            targetHexObject.hidden = false;
            var targetHexX = targetHex.data("data_xPos").toString();
            var targetHexY = targetHex.data("data_yPos").toString();
            var targetHexZ = targetHex.data("data_zPos").toString();
            boardObject.hexMap[targetHexX + targetHexY + targetHexZ].svgElement.attr({
                fill: this.attr("fill")
            });
            this.remove();
        } else { //hex has not been dragged on board
            var hexStartingPosX = this.data("startXPos");
            var hexStartingPosY = this.data("startYPos");
            var oldHexColor = this.attr("fill");
            this.remove();
            //this.transform("t" + this.data("startXPos")+ "," + this.data("startYPos"));
            var dragHex = boardObject.boardSVGElement.path("M" + hexStartingPosX + "," + hexStartingPosY + boardObject.hexPath).attr({
                fill: oldHexColor,
                stroke: "black",
                strokeWidth: 2,
                class:  "hexToDrag"
            })
            .data("startXPos", hexStartingPosX)
            .data("startYPos", hexStartingPosY);
            boardObject.subscribeHexDrag(dragHex);
        }
        $(".hexToDrag, .hexContainer").show();
    };
    hexSvgElement.drag(moveFunc, startFunc, endFunc);
}