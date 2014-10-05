//HEX EVENT SUBSCRIPTION
function hexEventSuscriber(hexObject, boardProperties) {
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
            revealHexAndAdjHexes(hexObject);
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

function revealHexAndAdjHexes(hexObject) {
    alert("STUB!");
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