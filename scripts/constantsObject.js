var CONSTANTS = {
    HEX_PATH: "l 30,20 l0,36 l -30,20 l -30,-20 l 0,-36 l 30,-20",
    HEX_WIDTH: 62,
    HEX_HEIGHT: 58,
    //amount of hexes revealed on first turn
    STARTING_HEX_DRAW: 5,
    MIN_AMT_PLAYERS: 2,
    MAX_AMT_PLAYERS: 8,
    MAX_WATER_HEXES: 24,
    MAX_FOREST_HEXES: 24,
    MAX_GRASS_HEXES: 24,
    MAX_PLAIN_HEXES: 24,
    MAX_MOUNTAIN_HEXES: 24,
    //hex colors
    MOUSE_OVER_STROKE_COLOR: "red",
    DEFAULT_STROKE_COLOR: "black",
    DEFAULT_STROKE_WIDTH: 3,
    //game constants
    INITIAL_HEX_DRAW: 5,
    //hex terrain types
    BLANK_TYPE: {
        COLOR:"white"
    },
    MOUNTAIN_TYPE: {
        COLOR : "gray"
    },
    WATER_TYPE: {
        COLOR: "blue"
    },
    GRASS_TYPE: {
        COLOR: "greenyellow"
    },
    FOREST_TYPE: {
        COLOR: "green"
    },
    PLAIN_TYPE: {
        COLOR: "yellow"
    }

};

Object.freeze(CONSTANTS);