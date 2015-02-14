//HEX EVENT SUBSCRIPTION

function dragHexEventSubscriber(hexSVGElement) {
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
        this.attr({
            class: "movingHex"
        });
        $(".hexToDrag, .hexContainer").hide();
    };
    var endFunc = function(e) {
        console.log("MOVE END");
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
            var targetHexObject = _HexMap[targetHex.data("data_xPos").toString() + targetHex.data("data_yPos").toString() +
                targetHex.data("data_zPos").toString()];
        }
        if(targetHex != null 
            && (targetHexObject.initial && targetHexObject.player == 1)
            && targetHexObject.hidden) {
            targetHexObject.hidden = false;
            var targetHexX = targetHex.data("data_xPos").toString();
            var targetHexY = targetHex.data("data_yPos").toString();
            var targetHexZ = targetHex.data("data_zPos").toString();
            _HexMap[targetHexX + targetHexY + targetHexZ].svgElement.attr({
                fill: this.attr("fill")
            });
            this.remove();
        } else { //hex has not been dragged on board
            var hexStartingPosX = this.data("startXPos");
            var hexStartingPosY = this.data("startYPos");
            var oldHexColor = this.attr("fill");
            this.remove();
            //this.transform("t" + this.data("startXPos")+ "," + this.data("startYPos"));
            var dragHex = _BoardSettings.boardSVGElement.path("M" + hexStartingPosX + "," + hexStartingPosY + _BoardSettings.hexPath).attr({
            fill: oldHexColor,
            stroke: "black",
            strokeWidth: 2,
            class:  "hexToDrag"
        })
        .data("startXPos", hexStartingPosX)
        .data("startYPos", hexStartingPosY);
        dragHexEventSubscriber(dragHex);
        }
        $(".hexToDrag, .hexContainer").show();
    };
    hexSVGElement.drag(moveFunc, startFunc, endFunc);
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
           var boardElement = Snap("#board");
           $(".hex").remove();
           var gameBoard = new Board(boardElement, parseInt($(this).val(), 10));
           gameBoard.createBoard();
           gameBoard.processTurn();
        } 
    });
}