//HEX EVENT SUBSCRIPTION
function hexEventSuscriber(hexObject, boardProperties, hexArray) {
	hexObject.svgElement.mouseover(function(){
            this.attr({
                stroke: "red"
            });
            displayHexCoords(this.data("data_xPos"), this.data("data_yPos"), this.data("data_zPos"));
        })
        .mouseout(function(){
            this.attr({
                stroke: "black"
            });
        })
        .dblclick(function() {
            revealHexAndAdjHexes(hexObject, hexArray, boardProperties);
        });
}
//HEX ELEMENT EVENTS
function displayHexCoords(x, y, z) {
    var xCoord = $("#hexXCoord");
    var yCoord = $("#hexYCoord");
    var zCoord = $("#hexZCoord");
    xCoord.html("X: " + x);
    yCoord.html("Y: " + y);
    zCoord.html("Z: " + z);
}

function revealHexAndAdjHexes(hexObject, boardHexes, boardProperties) {
    //get all adjacent hexes
    var adjHexes = findAllAdjHexesCoords(hexObject, boardHexes);
    //randomly choose hexes, loop over length of adjHexes
    var adjHexesTerrainType = [];
    for(var index = 0; index < adjHexes.length; index++) {
        adjHexesTerrainType.push(getHexTerrainType(boardProperties));
    }
    //display container with hex choices
    createAdjHexContainer(hexObject, boardHexes, adjHexes, adjHexesTerrainType);

    //allow dragging of these hexes to adjacent spots
}

function findAllAdjHexesCoords(hexObject) {
    //array of strings to contain hexs coords
    var adjHexes = [];
    //top left hex
    adjHexes.push((hexObject.svgElement.data("data_xPos") - 1).toString() + 
                  (hexObject.svgElement.data("data_yPos") + 1).toString() + 
                  hexObject.svgElement.data("data_zPos").toString());
    //top right hex
    adjHexes.push(hexObject.svgElement.data("data_xPos").toString() + 
                  (hexObject.svgElement.data("data_yPos") + 1).toString() + 
                  (hexObject.svgElement.data("data_zPos") - 1).toString());
    //center right
    adjHexes.push((hexObject.svgElement.data("data_xPos") + 1).toString() + 
                  hexObject.svgElement.data("data_yPos").toString() + 
                  (hexObject.svgElement.data("data_zPos") - 1).toString());
    //bottom right
    adjHexes.push((hexObject.svgElement.data("data_xPos") + 1).toString() + 
                  (hexObject.svgElement.data("data_yPos") - 1).toString() + 
                  hexObject.svgElement.data("data_zPos").toString());
    //bottom left
    adjHexes.push(hexObject.svgElement.data("data_xPos").toString() + 
                  (hexObject.svgElement.data("data_yPos") - 1).toString() + 
                  (hexObject.svgElement.data("data_zPos") + 1).toString());
    //center left
    adjHexes.push((hexObject.svgElement.data("data_xPos") - 1).toString() + 
                  hexObject.svgElement.data("data_yPos").toString() + 
                  (hexObject.svgElement.data("data_zPos") + 1).toString());

    return adjHexes;
}

function createAdjHexContainer(hexObject, boardHexes, adjHexes, adjHexesTerrainType) {
    var containerXCoord = hexObject.svgElement.getBBox().cx 
        - ( 2.5 * hexObject.svgElement.getBBox().width);
    var containerYCoord = hexObject.svgElement.getBBox().cy
        - (2.5 * _BoardSettings.hexHeight);
    //TODO: determine width of hex container by amount of hexes to reveal
    //create this containers drag functions
    var moveFunc = function(dx, dy, posx, posy) {
        //get the last position this element was dragged to (origX, origY)
        var origX = this.data("origX") == null ? 0 : this.data("origX");
        var origY = this.data("origY") == null ? 0 : this.data("origY");
        dx = dx + origX;
        dy = dy + origY;
        //store the position were moving it to now (lastX, lastY)
        this.data("lastX", dx);
        this.data("lastY", dy);
        this.transform("t" + dx + "," + dy);
    };
    var startFunc = function(x, y) {
        console.log("MOVE START");
    };
    var endFunc = function(e) {
        //ensure the orig positions are updated since the element seems to rever to 
        //it's orig position otherwise
        this.data("origX",this.data("lastX"));
        this.data("origY",this.data("lastY"));
    };
    //create svg group for container and the hex elements
    var containerGroup = _BoardSettings.boardSVGElement.g();
    //create container
    var hexContainer = _BoardSettings.boardSVGElement
        .rect(containerXCoord, containerYCoord, 500, 100)
        .attr({
        stroke: "black",
        fill: "white"
    });
    //create hexes here
    var newHexArray = [];
    var hexPath = _BoardSettings.hexPath;
    var hexWidth = _BoardSettings.hexWidth.toString();
    var initalHexX = containerXCoord + (hexWidth/2) + 8;
    var xAdjustment = 2;
    var newHex;
    containerGroup.add(hexContainer);
   // alert(adjHexes.length);
    for(var index = 0; index < adjHexes.length; index++) {
        //access each hex and change its terrain type
        newHex = _BoardSettings.boardSVGElement.path("M" + (initalHexX + xAdjustment)
                + "," + (containerYCoord + 10) + hexPath)
        .attr({
            stroke: "black",
            strokeWidth: 3,
            fill: adjHexesTerrainType[index],
            class: "movableHex"
        });
        containerGroup.add(newHex);
        xAdjustment += parseInt(hexWidth, 10) + 10;
    }
    //apply drag function test new git
    containerGroup.drag(moveFunc, startFunc, endFunc);
}

/*
function testDraw(hexElement, hexObject, board) {

    if(hexObject.units.length == 0) {
        var rectXPos = hexElement.getBBox().cx;
        var rectYPos = hexElement.getBBox().cy;
        //test object to draw on board
        var testRect = board.rect(rectXPos, rectYPos, 10, 10);
        testRect.dblclick(function() {
            this.attr({
                stroke: "red"
            });
            highlightAllAdjacentHexes(hexObject, _HexArray, board);
        });
        //create test infantry unit
        var testUnit = new Unit(_UnitGlobals.INFANTRY_TYPE, testRect, 
            hexElement.data("data_arrayIndex"));
        hexObject.units.push(testRect);
    } else {
        //remove rec from DOM
        hexObject.units[0].remove();
        //remove rec from array
        hexObject.units.pop();
    }
}

function highlightAllAdjacentHexes(hexObject, hexArray, board) {
    //to store our adj hexes
    var adjHexesGroup = [];
    //top left hex...
    var arrayKey = (hexObject.svgElement.data("data_xPos") - 1).toString() + 
        (hexObject.svgElement.data("data_yPos") + 1).toString() + 
        hexObject.svgElement.data("data_zPos").toString();
    adjHexesGroup.push(hexArray[arrayKey].svgElement);
    //top right hex
    arrayKey = hexObject.svgElement.data("data_xPos").toString() + 
        (hexObject.svgElement.data("data_yPos") + 1).toString() + 
        (hexObject.svgElement.data("data_zPos") - 1).toString();
    adjHexesGroup.push(hexArray[arrayKey].svgElement);
    //center right
    arrayKey = (hexObject.svgElement.data("data_xPos") + 1).toString() + 
        hexObject.svgElement.data("data_yPos").toString() + 
        (hexObject.svgElement.data("data_zPos") - 1).toString();
    adjHexesGroup.push(hexArray[arrayKey].svgElement);
    //bottom right
    arrayKey = (hexObject.svgElement.data("data_xPos") + 1).toString() + 
        (hexObject.svgElement.data("data_yPos") - 1).toString() + 
        hexObject.svgElement.data("data_zPos").toString();
    adjHexesGroup.push(hexArray[arrayKey].svgElement);
    //bottom left
    arrayKey = hexObject.svgElement.data("data_xPos").toString() + 
        (hexObject.svgElement.data("data_yPos") - 1).toString() + 
        (hexObject.svgElement.data("data_zPos") + 1).toString();
    adjHexesGroup.push(hexArray[arrayKey].svgElement);
    //center left
    arrayKey = (hexObject.svgElement.data("data_xPos") - 1).toString() + 
        hexObject.svgElement.data("data_yPos").toString() + 
        (hexObject.svgElement.data("data_zPos") + 1).toString();
    adjHexesGroup.push(hexArray[arrayKey].svgElement);

    for(var index = 0; index < adjHexesGroup.length; index++) {
        adjHexesGroup[index].attr({
            stroke: "red"
        });
    }
}
*/
//NON-HEX ELEMENT EVENTS
function attachDOMEvents() {
    //num players DDL
    $("#numPlayersSelect").on("change", function() {
        if($(this).val() != "") {
            createBoard($(this).val(), _BoardSettings);
        } else {
            clearBoard(_BoardSettings);
        }
    });
}