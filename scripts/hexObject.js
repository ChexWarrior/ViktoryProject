//Hex Constructor
function Hex(svgElement) {
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
    //METHODS
    //attaching events...
    this.eventSubscriber();
}

Hex.prototype.eventSubscriber = function() {
    this.subscribeMouseover();
    this.subscribeMouseout();
    //this.subscribeDrag(board);
}

Hex.prototype.subscribeMouseover = function() {
    this.svgElement.mouseover(function() {
        this.attr({
            stroke: CONSTANTS.MOUSE_OVER_STROKE_COLOR
        });
    });
};

Hex.prototype.subscribeMouseout = function() {
    this.svgElement.mouseout(function() {
        this.attr({
            stroke: CONSTANTS.DEFAULT_STROKE_COLOR
        });
    });
};


