
function TerrainType(color) {
    this.color = (color === undefined) ? "white" : color;
}

//global constants object
var CONSTANTS = {
    hexPath: "l 30,20 l0,36 l -30,20 l -30,-20 l 0,-36 l 30,-20",
    hexWidth: 62,
    hexHeight: 58,
    //amount of hexes revealed on first turn
    startingHexDraw: 5,
    minAmtPlayers: 2,
    maxAmtPlayers: 8,
    maxWaterHexes: 24,
    maxForestHexes: 24,
    maxGrassHexes: 24,
    maxPlainHexes: 24,
    maxMountainHexes: 24,
    //hex colors
    mouseOverStrokeColor: "red",
    defaultStrokeColor: "black",
    defaultStrokeWidth: 3,
    //game constants
    initialHexDraw: 5,
    //hex terrain types
    blankTerrainType: new TerrainType(),
    mountainTerrainType: new TerrainType("gray"),
    waterTerrainType: new TerrainType("blue"),
    grassTerrainType: new TerrainType("yellowgreen"),
    forestTerrainType: new TerrainType("green"),
    plainsTerrainType: new TerrainType("yellow")
};

Object.freeze(CONSTANTS);

