//Game Board Constructor
function Board(svgElement, numberOfPlayers) {
    var boardObject = this;
    function setRowInformation() {
            switch(boardObject.numPlayers) {
            case 2:
            boardObject.totalRows = 9;
            boardObject.initRowLength = 5; 
            //total number of hexes on board (NOT INCLUDING BORDER HEXES)
            boardObject.numHexes = 37;
            break;
            case 3:
            boardObject.totalRows = 11;
            boardObject.initRowLength = 6; 
            //total number of hexes on board (NOT INCLUDING BORDER HEXES)
            this.numHexes = 61;
            break;
            case 4:
            boardObject.totalRows = 13;
            boardObject.initRowLength = 7; 
            //total number of hexes on board (NOT INCLUDING BORDER HEXES)
            this.numHexes = 91;
            break;
            case 5:
            case 6:
            case 7:
            case 8:
            boardObject.totalRows = 15;
            boardObject.initRowLength = 8; 
            //total number of hexes on board (NOT INCLUDING BORDER HEXES)
            boardObject.numHexes = 127;
            break;
            default:
            //default to 2 players
            boardObject.totalRows = 9;
            boardObject.initRowLength = 5; 
            //total number of hexes on board (NOT INCLUDING BORDER HEXES)
            boardObject.numHexes = 37;
        }
    }
    //PROPERTIES
    this.svgElement = svgElement;
    this.gameOver = false;
    this.currentRound = 0;
    this.currentPlayerTurn = 1;
    //will contain all hexes on board
    this.hexMap = {};
    //will contain hexes in drag container
    this.containerHexArray = [];
    this.numPlayers = numberOfPlayers;
    //initialize row total and length
    setRowInformation();
    //total pull of hexes for every board size (DOES NOT INCLUDE BOARDER HEXES!)
    this.totalPossibleHexes = 132;
    //x and y pos of first hex
    this.initialHex_XPos = 250;
    this.initialHex_YPos = 10;

    this.currentAmtWaterHexes = CONSTANTS.maxWaterHexes;
    this.currentAmtForestHexes = CONSTANTS.maxForestHexes;
    this.currentAmtGrassHexes = CONSTANTS.maxGrassHexes;
    this.currentAmtPlainHexes = CONSTANTS.maxPlainHexes;
    this.currentAmtMountainHexes = CONSTANTS.maxMountainHexes;
}

Board.prototype.changeTurn = function() {
    //TODO: create method
    if(this.currentPlayerTurn === this.numPlayers) {
        this.currentPlayerTurn = 0;
        this.currentRound += 1;
    } else {
        this.currentPlayerTurn += 1;
    }
    $("#playerTurnIndicator").html("Player Turn: " + this.currentPlayerTurn);
}

Board.prototype.getDragoverHex = function(xPos, yPos) {
    for(var hex in this.hexMap) {
        if(this.hexMap.hasOwnProperty(hex)) {
             if(Snap.path.isPointInside(this.hexMap[hex].svgElement, xPos, yPos)) {
                return this.hexMap[hex];
            }
        }
    }
    return null;
}

Board.prototype.getHex = function(xPos, yPos, zPos) {
    return this.hexMap[xPos.toString() + yPos.toString() + zPos.toString()];
}

Board.prototype.setHex = function(xPos, yPos, zPos, newHex) {
    this.hexMap[xPos.toString() + yPos.toString() + zPos.toString()] = newHex;
}

Board.prototype.revealHexTerrainType = function() {
    //1d100
    var terrainType = CONSTANTS.blankTerrainType.color;
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
        this.currentAmtMountainHexes -= 1;
        terrainType = CONSTANTS.mountainTerrainType;
    } else if(plainRange) {
        this.currentAmtPlainHexes -= 1;
        terrainType = CONSTANTS.plainsTerrainType;
    } else if(forestRange) {
        this.currentAmtForestHexes -= 1;
        terrainType = CONSTANTS.forestTerrainType;
    } else if(grassRange) {
        this.currentAmtGrassHexes -= 1;
        terrainType = CONSTANTS.grassTerrainType;
    } else if(waterRange) {
        this.currentAmtWaterHexes -= 1;
        terrainType = CONSTANTS.waterTerrainType;
    } else {
        console.log("ERROR: revealHexTerrainType");
    }    
    //reduce total amount of all hexes by one
    this.totalPossibleHexes -= 1;
    /*console.log("Random Roll: " + randomRoll + "\nTotal Amt of Hexes: " + this.totalPossibleHexes + 
    "\nChance/Range of Mountain: " + chanceOfMountain + "/" + mountainRange +
    "\nChance/Range of Forest: " + chanceOfForest + "/" + forestRange + 
    "\nChance/Range of Grassland: " + chanceOfGrass + "/" + grassRange +
    "\nChance/Range of Plain: " + chanceOfPlain + "/" + plainRange +
    "\nChance/Range of Water: " + chanceOfWater + "/" + waterRange);
    */
    return terrainType;
}

Board.prototype.createBoard = function() {
    var boardObject = this;
    //include helper functions in here
    function getHexCoordinates(hexRowIndex, hexIndex, rowLength) {
        var middleRow = Math.floor(boardObject.totalRows / 2);
        var first_XPos = 0;
        var currentYPos = Math.floor(boardObject.totalRows / 2) - hexRowIndex;
        var currentXPos = 0;
        var currentZPos = 0;
        //x and z calculations for first half of board
        if(hexRowIndex <= middleRow) {
            first_XPos = (rowLength - boardObject.totalRows) - hexRowIndex;
            currentXPos = first_XPos + hexIndex;
        } else {
            first_XPos = -(rowLength - boardObject.totalRows + middleRow);
            currentXPos = first_XPos + hexIndex;
        }
        currentZPos = -currentXPos - currentYPos;

        return [currentXPos, currentYPos, currentZPos];
    }

    function createHex(hex_XPos, hex_YPos, currentRowIndex, currentHexIndex, rowLength) {
        //calculate hexes starting position    
        var isHexOnBorder = currentHexIndex === 0 || currentHexIndex === rowLength - 1
            || currentRowIndex === 0 || currentRowIndex === boardObject.totalRows - 1;
        var hex_xyzCoords = getHexCoordinates(currentRowIndex, currentHexIndex, rowLength);
        var hexKey = hex_xyzCoords[0].toString() + hex_xyzCoords[1].toString() + hex_xyzCoords[2].toString();
        var newHexParameters = {
            terrainType: !isHexOnBorder ? CONSTANTS.blankTerrainType : CONSTANTS.waterTerrainType,
            isDraggable: false,
            player: null,
            boardObject: boardObject,
            xyzCoords: hex_xyzCoords,
            xPosition: hex_XPos,
            yPosition: hex_YPos,
            isOnBorder: isHexOnBorder,
            cssClass: "hex",
            containerArrayPos: null,
            isHidden: true
        };
        var newHex = new Hex(newHexParameters);
        newHex.subscribeHexEvents(boardObject);
        boardObject.hexMap[hexKey] = newHex;
    }

    function createHexRow(currentRowLength, currentRowIndex, currentXPos, currentYPos) {
        for(var currentHex = 0; currentHex < currentRowLength; currentHex += 1) {
            createHex(currentXPos, currentYPos, currentRowIndex, currentHex, currentRowLength);
            currentXPos += CONSTANTS.hexWidth;
        }   
    }

    var currentRowLength = boardObject.initRowLength;
    var currentX_Pos = boardObject.initialHex_XPos;
    var currentY_Pos = boardObject.initialHex_YPos;
    var middleRow = Math.floor(boardObject.totalRows / 2);
    for(var currentRow = 0; currentRow < boardObject.totalRows; currentRow += 1) {
        createHexRow(currentRowLength, currentRow, currentX_Pos, currentY_Pos);
        if(currentRow < middleRow) {
            currentRowLength += 1;
            currentX_Pos -= CONSTANTS.hexWidth / 2;
        } else {
            currentRowLength -= 1;
            currentX_Pos += CONSTANTS.hexWidth / 2;
        }
        currentY_Pos += CONSTANTS.hexHeight;
    }
}

Board.prototype.displayDragHexChoices = function(numberOfHexesToDraw) {
    var boardObject = this;

    function createHexContainer(numberOfHexesToDraw) {
        var hexWidth = CONSTANTS.hexWidth;
        var hexHeight = CONSTANTS.hexHeight;
        var centerXPosOfBoard = boardObject.svgElement.getBBox().cx;
        var hexContainerPadding = 10;
        var hexContainerWidth = (hexWidth * numberOfHexesToDraw) + (hexContainerPadding * numberOfHexesToDraw);
        var hexContainerTopLeftX = Math.abs(centerXPosOfBoard - hexContainerWidth / 2);
        var hexContainerHeight = hexHeight + (hexContainerPadding * 2.5);
        var hexContainerTopLeftY = boardObject.svgElement.getBBox().cy - hexHeight;
        var hexContainer = boardObject.svgElement.rect(hexContainerTopLeftX, hexContainerTopLeftY, hexContainerWidth,
            hexContainerHeight, 10).attr({
                fill: CONSTANTS.blankTerrainType.color,
                stroke: CONSTANTS.defaultStrokeColor,
                strokeWidth: CONSTANTS.defaultStrokeWidth,
                class: "hexContainer"
            });

        return hexContainer;
    }

    function createHexesToDrag(hexContainer, numberOfHexesToDraw) {
        var hexPadding = 10;
        var hexStartingPosX = hexContainer.getBBox().x + (CONSTANTS.hexWidth / 2) + hexPadding;
        var hexStartingPosY = hexContainer.getBBox().y + 3;
        var newHexObject = null;
        var newHexParameters = {};
        for(var hexIndex = 0; hexIndex < numberOfHexesToDraw; hexIndex += 1) {
            newHexParameters = {
                terrainType: boardObject.revealHexTerrainType(),
                isDraggable: true,
                player: null,
                boardObject: boardObject,
                xyzCoords: [0, 0, 0],
                xPosition: hexStartingPosX,
                yPosition: hexStartingPosY,
                isOnBorder: false,
                cssClass: "hexToDrag hex",
                containerArrayPos: hexIndex,
                isHidden: false
            };
            newHexObject = new Hex(newHexParameters);
            newHexObject.subscribeHexEvents(boardObject);
            hexStartingPosX += CONSTANTS.hexWidth + (hexPadding / 2);
            boardObject.containerHexArray[hexIndex] = newHexObject;
        }  
    }

    var hexContainer = createHexContainer(numberOfHexesToDraw);
    createHexesToDrag(hexContainer, numberOfHexesToDraw);
}

Board.prototype.processPlayerTurn = function(currentPlayerTurn) {
    var boardObject = this;
    function determineStartingHexes(currentPlayerTurn) {
           switch(boardObject.numPlayers) {
            case 2:
            if(currentPlayerTurn === 1) {
                //first player initial hexes
                boardObject.hexMap["-330"].isDragTarget = true;
                boardObject.hexMap["-330"].player = 1;
                boardObject.hexMap["-23-1"].isDragTarget = true;
                boardObject.hexMap["-23-1"].player = 1;
                boardObject.hexMap["-13-2"].isDragTarget = true;
                boardObject.hexMap["-13-2"].player = 1;
                boardObject.hexMap["-321"].isDragTarget = true;
                boardObject.hexMap["-321"].player = 1;
                boardObject.hexMap["-312"].isDragTarget = true;
                boardObject.hexMap["-312"].player = 1;
            } else {
                //second player initial hexes
                boardObject.hexMap["3-30"].isDragTarget = true;
                boardObject.hexMap["3-30"].player = 2;
                boardObject.hexMap["3-2-1"].isDragTarget = true;
                boardObject.hexMap["3-2-1"].player = 2;
                boardObject.hexMap["3-1-2"].isDragTarget = true;
                boardObject.hexMap["3-1-2"].player = 2;
                boardObject.hexMap["2-31"].isDragTarget = true;
                boardObject.hexMap["2-31"].player = 2;
                boardObject.hexMap["1-32"].isDragTarget = true;
                boardObject.hexMap["1-32"].player = 2;
            }
            break;
            //TODO: cases for other number of players
            default:
        }
    }
    //initial round
    if(this.currentRound === 0) {
        determineStartingHexes(this.currentPlayerTurn)
        this.displayDragHexChoices(CONSTANTS.initialHexDraw);
    } else {
        //TODO: Create normal player turn flow
    }
}