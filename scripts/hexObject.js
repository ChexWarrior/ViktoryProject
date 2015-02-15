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
}

Hex.prototype.subscribeDrag = function() {

}