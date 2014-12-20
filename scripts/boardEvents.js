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
            testDragEvent(hexObject, hexArray, boardProperties);
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

function testDragEvent(hexObject, hexArray, boardProperties) {
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
    };
    var endFunc = function(e) {
        //ensure the orig positions are updated since the element seems to rever to 
        //it's orig position otherwise
        this.data("origX",this.data("lastX"));
        this.data("origY",this.data("lastY"));
        console.clear();
        console.log("Orig center x pos: " + this.data("data_hexCenterX") + " Orig center y pos: " + this.data("data_hexCenterY"));
        //update hexes new center position
        this.data("data_hexCenterX", this.getBBox().cx);
        this.data("data_hexCenterY", this.getBBox().cy);
        console.log("New center x pos: " + this.data("data_hexCenterX") + " New center y pos: " + this.data("data_hexCenterY"));
        
        findClosestHex(this.data("data_hexCenterX"), this.data("data_hexCenterY"), _HexIndexedArray);
    };

    hexObject.svgElement.drag(moveFunc, startFunc, endFunc);
}

function findClosestHex(currentXPos, currentYPos, hexArray) {
    for(var hexArrayIndex = 0; hexArrayIndex < hexArray.length; hexArrayIndex++) {
        if(Snap.path.isPointInside(hexArray[hexArrayIndex].svgElement, currentXPos, currentYPos)) {
            hexArray[hexArrayIndex].svgElement.attr({
                fill: "green"
            });
        }
    }
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