//Hex Constructor
function Hex(hexParameters) {
    //PROPERTIES
    //been revealed?
    this.hidden = hexParameters.isHidden; 
    this.terrainType = hexParameters.terrainType;
    //who controls this hex
    this.player = hexParameters.player;
    //is a starting hex initial hex
    //this.initial = false;
    //is being dragged into place
    this.draggable = hexParameters.isDraggable;
    //can be dragged onto by a draggable hex
    this.isDragTarget = false;
    var hexPathPos = "M" + hexParameters.xPosition.toString() 
        + "," + hexParameters.yPosition.toString();
    //svg element creation...
    var svgHex = hexParameters.boardObject.svgElement.path(hexPathPos + CONSTANTS.hexPath)
        .attr({
            fill: hexParameters.terrainType.color,
            stroke: CONSTANTS.defaultStrokeColor,
            strokeWidth: CONSTANTS.defaultStrokeWidth,
            class: hexParameters.cssClass
        })
        .data("data_svgXPos", hexParameters.xPosition)
        .data("data_svgYPos", hexParameters.yPosition)
        .data("data_isBorderHex", hexParameters.isOnBorder)
        .data("data_xPos", hexParameters.xyzCoords[0])
        .data("data_yPos", hexParameters.xyzCoords[1])
        .data("data_containerArrayPosition", 
            hexParameters.containerArrayPos === undefined ? null : hexParameters.containerArrayPos)
        .data("data_zPos", hexParameters.xyzCoords[2]);
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
             stroke: CONSTANTS.mouseOverStrokeColor
        });
    });
}

Hex.prototype.subscribeHexMouseout = function() {
    this.svgElement.mouseout(function() {
        this.attr({
             stroke: CONSTANTS.defaultStrokeColor
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
            var oldArrayPos = this.data("data_containerArrayPosition");
            targetHex.handleDragDrop(this);
            this.remove();
        } else { //hex has not been dragged on board
            this.remove();
            var newHexParameters = {
                terrainType: boardObject.containerHexArray[this.data("data_containerArrayPosition")].terrainType,
                isDraggable: true,
                player: null,
                boardObject: boardObject,
                xyzCoords: [this.data("data_xPos"), this.data("data_yPos"), this.data("data_zPos")],
                xPosition: this.data("data_svgXPos"),
                yPosition: this.data("data_svgYPos"),
                isOnBorder: this.data("data_isBorderHex"),
                cssClass: "hexToDrag",
                containerArrayPos: this.data("data_containerArrayPosition"),
                isHidden: false
            };
            var newHexObject = new Hex(newHexParameters);
            newHexObject.subscribeHexEvents(boardObject);
        }
        $(".hexToDrag, .hexContainer").show();
    };
    this.svgElement.drag(moveFunc, startFunc, endFunc);
}