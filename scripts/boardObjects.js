//Hex Constructor
function Hex(svgElement) {
    //PROPERTIES
    //current turn
    this.turn = 0;
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
    //array of units present on this hex
    this.units = [];
    //city, town or metropolis?
    this.structure = null; 
    //who controls this hex
    this.player = null;
    //METHODS
}

//Unit Constructor
function Unit(unitType, svgElement, homeHexIndex) {
    //PROPERTIES
    //Infantry, Calvary, Artillery or Frigate
    this.unitType = unitType;
    //unit type specific props
    switch(unitType) {
        case _UnitGlobals.CALVARY_TYPE:
            //number of spaces unit can move each turn
            this.move = _UnitGlobals.CALVARY_MOVE;
        break;
        case _UnitGlobals.INFANTRY_TYPE:
            this.move = _UnitGlobals.INFANTRY_MOVE;
        break;
        case _UnitGlobals.ARTILLERY_TYPE:
            this.move = _UnitGlobals.ARTILLERY_MOVE;
        break;
        case _UnitGlobals.FRIGATE_TYPE:
            this.move = _UnitGlobals.FRIGATE_MOVE;
        break;
    }
    //ref to unit svg element
    this.svgElement = svgElement;
    //which player controls this unit
    this.player = null;
    //is unit in reserve
    this.inReserve = true;
    //is this unit done moving/attacking
    this.turnDone = false;
    //is this unit about to attack
    this.battleStart = false;
    //hex that this unit is attached to
    this.homeHexIndex = homeHexIndex;
    //METHODS
}