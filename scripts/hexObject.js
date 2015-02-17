//Hex Constructor
function Hex(svgElement, isDraggable) {
    //PROPERTIES
    //ref to snap.svg element of hex
    this.svgElement = svgElement;
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
    this.player = null;
    //is a starting hex initial hex
    this.initial = false;
    //is being dragged into place
    this.draggable = isDraggable;
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
        //find which hex we dragged this hex over...
        var targetHex = boardObject.getDragoverHex(newHexCenterX, newHexCenterY);
        if(targetHex != null) {
            var targetHexObject = boardObject.getHex(targetHex.data("data_xPos"), targetHex.data("data_yPos"), 
                targetHex.data("data_zPos"));
        }
        if(targetHex != null &&
          //and is the drag over hex an initial hex and the correct players inital hex
          (targetHexObject.initial && targetHexObject.player == boardObject.currentPlayerTurn) &&
           //and the hex hasn't been revealed
          targetHexObject.hidden) {
            targetHexObject.hidden = false;
            var targetHexX = targetHex.data("data_xPos").toString();
            var targetHexY = targetHex.data("data_yPos").toString();
            var targetHexZ = targetHex.data("data_zPos").toString();
            //change target hex to have same terrain type as dragged hex
            boardObject.getHex(targetHexX , targetHexY, targetHexZ).svgElement.attr({
                fill: this.attr("fill")
            });
            this.remove();
        } else { //hex has not been dragged on board
            var hexStartingPosX = this.data("data_svgXPos");
            var hexStartingPosY = this.data("data_svgYPos");
            var oldTerrainType = this.attr("fill");
            var oldXYZCoords = [this.data("data_xPos"), this.data("data_yPos"), this.data("data_zPos")];
            var oldIsOnBorder = this.data("data_isBorderHex");
            this.remove();
            var dragHex = boardObject.createHexSVGElement(oldTerrainType, oldXYZCoords, hexStartingPosX, 
                hexStartingPosY, oldIsOnBorder, "hexToDrag");
            dragHex.data("data_svgXPos", hexStartingPosX)
            dragHex.data("data_svgYPos", hexStartingPosY);
            var newHexObject = new Hex(dragHex, true);
            newHexObject.subscribeHexEvents(boardObject);
        }
        $(".hexToDrag, .hexContainer").show();
    };
    this.svgElement.drag(moveFunc, startFunc, endFunc);
}