//Hex Constructor
function Hex(terrainType, isDraggable, player, boardObject, terrainType, xyzCoords, xPosition, yPosition, isOnBorder, cssClass) {
    //PROPERTIES

    //been revealed?
    this.hidden = true; 
    this.terrainType = null;
    //who controls this hex
    this.player = player;
    //is a starting hex initial hex
    //this.initial = false;
    //is being dragged into place
    this.draggable = isDraggable;
    //can be dragged onto by a draggable hex
    this.isDragTarget = false;
    var hexPathPos = "M" + xPosition.toString() + "," + yPosition.toString();
    //svg element creation...
    var svgHex = boardObject.svgElement.path(hexPathPos + CONSTANTS.HEX_PATH)
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
    this.svgElement = svgHex;
}

Hex.prototype.subscribeHexEvents = function(boardObject) {
    this.subscribeHexMouseover();
    this.subscribeHexMouseout();
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
//process events that occur when a hex is dragged over this hex
Hex.prototype.handleDragDrop = function(dragHex) {
    this.hidden = false;
    this.svgElement.attr({
        fill: dragHex.attr("fill")
    });
    this.isDragTarget = false;
}

Hex.prototype.subscribeHexDrag = function(boardObject) {
    var moveFunc = function(dx, dy, posx, posy) {
        //get the last position this element was dragged to (origX, origY)
        var origX = this.data("origX") === undefined ? 0 : this.data("origX");
        var origY = this.data("origY") === undefined ? 0 : this.data("origY");
        dx = dx + origX;
        dy = dy + origY;
        //store the position were moving it to now (lastX, lastY)
        this.data("lastX", dx);
        this.data("lastY", dy);
        //actually move the hex...
        this.transform("t" + dx + "," + dy);
    };
    var startFunc = function(x, y) {
        this.attr({
            class: "movingHex"
        });
        $(".hexToDrag, .hexContainer").hide();
    };
    var endFunc = function(e) {
        var origHexCenterX = this.data("data_hexCenterX");
        var origHexCenterY = this.data("data_hexCenterY");
        var newHexCenterX = this.getBBox().cx;
        var newHexCenterY = this.getBBox().cy;
        var targetHex = boardObject.getDragoverHex(newHexCenterX, newHexCenterY);
        //you dragged over a hex and it can be dragged onto
        if(targetHex !== null && targetHex.isDragTarget && targetHex.player === boardObject.currentPlayerTurn) {
            targetHex.handleDragDrop(this);
            this.remove();
        } else { //hex has not been dragged on board
            var hexStartingPosX = this.data("data_svgXPos");
            var hexStartingPosY = this.data("data_svgYPos");
            var oldTerrainType = this.attr("fill");
            var oldXYZCoords = [this.data("data_xPos"), this.data("data_yPos"), this.data("data_zPos")];
            var oldIsOnBorder = this.data("data_isBorderHex");
            this.remove();
            var newHexObject = new Hex(oldTerrainType, true, this.player, boardObject, oldTerrainType, oldXYZCoords, hexStartingPosX, 
                hexStartingPosY, oldIsOnBorder, "hexToDrag");
            newHexObject.svgElement.data("data_svgXPos", hexStartingPosX);
            newHexObject.svgElement.data("data_svgYPos", hexStartingPosY);
            newHexObject.subscribeHexEvents(boardObject);
        }
        $(".hexToDrag, .hexContainer").show();
    };
    this.svgElement.drag(moveFunc, startFunc, endFunc);
}