//HEX EVENT SUBSCRIPTION
function hexEventSuscriber(hexObject, boardProperties, hexArray) {
	hexObject.svgElement.mouseover(function(){
            this.attr({
                stroke: "red"
            });
            //displayHexCoords(this.data("data_xPos"), this.data("data_yPos"), this.data("data_zPos"));
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
//HEX ELEMENT EVENTS!
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
        //store dragged hexe's original center point
        var origHexCenterX = this.data("data_hexCenterX");
        var origHexCenterY = this.data("data_hexCenterY");
        //console.clear();
        //console.log("Orig center x pos: " + origHexCenterX  + " Orig center y pos: " + origHexCenterY);
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
            //in case of failure move hex back to it's originial position
            this.remove();
            //create variables needed to create hex
            //get position of old hex.
            var hexPosition = hexObject.svgElement.realPath.substring(hexObject.svgElement.realPath.indexOf("M"),
                hexObject.svgElement.realPath.indexOf("l"));
            //console.log(hexPosition);
            //console.log(hexPosition.substring(0, hexPosition.indexOf(",")));
            //console.log(hexPosition.substring(hexPosition.indexOf(",") + 1, hexPosition.length));
            var xPos = hexPosition.substring(0, hexPosition.indexOf(","));
            var yPos = hexPosition.substring(hexPosition.indexOf(",") + 1, hexPosition.length);
            //get actual hex path of old hex...
            var hexPath = hexObject.svgElement.realPath.substring(hexObject.svgElement.realPath.indexOf("l"),
                hexObject.svgElement.realPath.length);
            //console.log(hexPath);
            var xyzArray = [hexObject.svgElement.data("data_xPos"), hexObject.svgElement.data("data_yPos"), 
                hexObject.svgElement.data("data_zPos")];
            var hexKey = hexObject.svgElement.data("data_xPos").toString() + hexObject.svgElement.data("data_yPos").toString()
                + hexObject.svgElement.data("data_zPos").toString();
            var newHex = createHexSVGElement(boardProperties, "white", hexPosition, hexPath,
                xyzArray, xPos, yPos, false);
            //replace old objects svg element with new hex...
            _HexMap[hexKey].svgElement = newHex;
            //resubscribe hex to events
            hexEventSuscriber(_HexMap[hexKey], boardProperties, _HexMap);
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

function displayStartingHexes() {
    var numPlayers = _BoardSettings.numPlayers;
    console.log("Number of Players: " + numPlayers);
    displayHexChoices(_BoardSettings.INITIAL_HEX_DRAW);
}

function displayHexChoices(numberOfHexesToDraw) {
    //create box for number of hexes...
    var hexContainer = createHexContainer(numberOfHexesToDraw);
}

function createHexContainer(numberOfHexesToDraw) {
    var hexWidth = _BoardSettings.hexWidth;
    var hexHeight = _BoardSettings.hexHeight;

    var leftXValueOfBoard = _BoardSettings.boardSVGElement.getBBox().x;
    var topYValueOfBoard = _BoardSettings.boardSVGElement.getBBox().y;
    var bottomYValueOfBoard = _BoardSettings.boardSVGElement.getBBox().y2;
    var middleYValueOfBoard = Math.abs(topYValueOfBoard - bottomYValueOfBoard) / 2;
    var topMiddleYValueOfBoard = Math.abs(topYValueOfBoard - middleYValueOfBoard) / 2; 
    
    var hexContainerPadding = 10;
    var hexContainerWidth = (hexWidth * numberOfHexesToDraw) + (hexContainerPadding * numberOfHexesToDraw);
    var hexContainerHeight = hexHeight + (hexContainerPadding * 2);
    var hexContainerTopLeftX = leftXValueOfBoard + hexContainerPadding;
    var hexContainerTopLeftY = topMiddleYValueOfBoard;

    var hexContainer = _BoardSettings.boardSVGElement.rect(hexContainerTopLeftX, hexContainerTopLeftY, 
        hexContainerWidth, hexContainerHeight, 10).attr({
            fill: "white",
            stroke: "black"
        });

    console.log(_BoardSettings.boardSVGElement.getBBox().cx + "," + _BoardSettings.boardSVGElement.getBBox().cy);   
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
        displayStartingHexes();
    });
}