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
        //console.log("MOVE START");
    };
    var endFunc = function(e) {
        //store dragged hexe's original center point
        var origHexCenterX = this.data("data_hexCenterX");
        var origHexCenterY = this.data("data_hexCenterY");

        console.clear();
        console.log("Orig center x pos: " + origHexCenterX  + " Orig center y pos: " + origHexCenterY);
        //store the new center of the dragged hex...
        var newHexCenterX = this.getBBox().cx;
        var newHexCenterY = this.getBBox().cy;
        
        //console.log("New center x pos: " + newHexCenterX + " New center y pos: " + newHexCenterY);
        //find which hex we dragged this hex over...
        var targetHex = getDropHex(newHexCenterX, newHexCenterY, _HexMap);
        if(targetHex != null) {
            //ensure the orig positions are updated since the element seems to rever to 
            //it's orig position otherwise
            this.data("origX", this.data("lastX"));
            this.data("origY", this.data("lastY"));
            //update the hexes new center
            this.data("data_hexCenterX", newHexCenterX);
            this.data("data_hexCenterY", newHexCenterY);
            //change drop hex color to indicate it
            targetHex.attr({
                fill: "green"
            });
        }
        else {
            //console.log("targetHex is null");
            //in case of failure move hex back to it's originial position
            //need to ensure all events get properly reattached...
            this.remove();
            boardProperties.boardSVGElement.path(hexObject.svgElement.realPath);
        }
    };

    hexObject.svgElement.drag(moveFunc, startFunc, endFunc);
}

function getDropHex(currentXPos, currentYPos, hexMap) {
    for (var hex in hexMap) {
        if(Snap.path.isPointInside(hexMap[hex].svgElement, currentXPos, currentYPos)) {
            //return target hex
            return hexMap[hex].svgElement;
        }
    }

    return null;
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