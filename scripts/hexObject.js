//Hex Constructor
function Hex(terrainType, isDraggable, player) {
    //PROPERTIES
    //ref to snap.svg element of hex
    this.svgElement = null;
    //been revealed?
    this.hidden = true; 
    //battle fought on this hex this turn?
    this.hadBattle = false; 
    this.isMetropolis = false;
    this.terrainType = null;
    //causes cannons and infantry to stop when moving in
    this.slowTerrain = false;
    //map of units present on this hex
    this.units = {};
    //city, town or metropolis?
    this.structure = null; 
    //who controls this hex
    this.player = player;
    //is a starting hex initial hex
    //this.initial = false;
    //is being dragged into place
    this.draggable = isDraggable;
    //can be dragged onto by a draggable hex
    this.isDragTarget = false;
}

Hex.prototype.createSvgElement = function(boardObject, terrainType, xyzCoords, xPosition, yPosition, isOnBorder, cssClass) {
    var hexPathPos = "M" + xPosition.toString() + "," + yPosition.toString();
    var svgHex = boardObject.boardSVGElement.path(hexPathPos + CONSTANTS.HEX_PATH)
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

    //store reference
    this.svgElement = svgHex;
}

Hex.prototype.subscribeHexEvents = function(boardObject) {
    this.subscribeHexMouseover();
    this.subscribeHexMouseout();
    //only subscribe to event if this is a draggable hex
    if(this.draggable) {
        this.subscribeHexDrag(boardObject);
    }
}

Hex.prototype.subscribeHexMouseover = function() {
    this.svgElement.mouseover(function() {
        this.attr({
             stroke: CONSTANTS.MOUSE_OVER_STROKE_COLOR
        });
    });
}

Hex.prototype.subscribeHexMouseout = function() {
    this.svgElement.mouseout(function() {
        this.attr({
             stroke: CONSTANTS.DEFAULT_STROKE_COLOR
        });
    });
}

Hex.prototype.subscribeHexDrag = function(boardObject) {
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
        this.attr({
            class: "movingHex"
        });
        $(".hexToDrag, .hexContainer").hide();
    };
    var endFunc = function(e) {
        //console.log("MOVE END");
        var origHexCenterX = this.data("data_hexCenterX");
        var origHexCenterY = this.data("data_hexCenterY");
        //store the new center of the dragged hex...
        var newHexCenterX = this.getBBox().cx;
        var newHexCenterY = this.getBBox().cy;
        var targetHexObject = null;
        //find which hex we dragged this hex over...
        var targetHex = boardObject.getDragoverHex(newHexCenterX, newHexCenterY);
        if(targetHex != null) {
            targetHexObject = boardObject.getHex(targetHex.data("data_xPos"), targetHex.data("data_yPos"), 
                targetHex.data("data_zPos"));
        }
        //you dragged over a hex and it can be dragged onto
        if(targetHexObject != null && targetHexObject.isDragTarget && targetHexObject.player == boardObject.currentPlayerTurn) {
            targetHexObject.hidden = false;
            var targetHexX = targetHex.data("data_xPos").toString();
            var targetHexY = targetHex.data("data_yPos").toString();
            var targetHexZ = targetHex.data("data_zPos").toString();
            //change target hex to have same terrain type as dragged hex
            targetHexObject.svgElement.attr({
                fill: this.attr("fill")
            });
            //ensure this hex can is no longer a drag target
            targetHexObject.isDragTarget = false;
            this.remove();
        } else { //hex has not been dragged on board
            var hexStartingPosX = this.data("data_svgXPos");
            var hexStartingPosY = this.data("data_svgYPos");
            var oldTerrainType = this.attr("fill");
            var oldXYZCoords = [this.data("data_xPos"), this.data("data_yPos"), this.data("data_zPos")];
            var oldIsOnBorder = this.data("data_isBorderHex");
            this.remove();
            //var dragHex = boardObject.createHexSVGElement(oldTerrainType, oldXYZCoords, hexStartingPosX, 
            //    hexStartingPosY, oldIsOnBorder, "hexToDrag");
            //dragHex.data("data_svgXPos", hexStartingPosX)
            //dragHex.data("data_svgYPos", hexStartingPosY);
            var newHexObject = new Hex(oldTerrainType, true, this.player);
            newHexObject.createSvgElement(boardObject, oldTerrainType, oldXYZCoords, hexStartingPosX, 
                hexStartingPosY, oldIsOnBorder, "hexToDrag");
            newHexObject.svgElement.data("data_svgXPos", hexStartingPosX);
            newHexObject.svgElement.data("data_svgYPos", hexStartingPosY);
            newHexObject.subscribeHexEvents(boardObject);
        }
        $(".hexToDrag, .hexContainer").show();
    };
    this.svgElement.drag(moveFunc, startFunc, endFunc);
}