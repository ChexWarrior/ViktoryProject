$(document).ready(function() {
    attachDOMEvents();    
});

function determineStartingHexes(numPlayers) {
    switch(numPlayers) {
        case 2:
            //first player initial hexes
            _HexMap["-330"].initial = true;
            _HexMap["-330"].player = 1;
            _HexMap["-23-1"].initial = true;
            _HexMap["-23-1"].player = 1;
            _HexMap["-13-2"].initial = true;
            _HexMap["-13-2"].player = 1;
            _HexMap["-321"].initial = true;
            _HexMap["-321"].player = 1;
            _HexMap["-312"].initial = true;
            _HexMap["-312"].player = 1;
            //second player initial hexes
            _HexMap["3-30"].initial = true;
            _HexMap["3-30"].player = 2;
            _HexMap["3-2-1"].initial = true;
            _HexMap["3-2-1"].player = 2;
            _HexMap["3-1-2"].initial = true;
            _HexMap["3-1-2"].player = 2;
            _HexMap["2-31"].initial = true;
            _HexMap["2-31"].player = 2;
            _HexMap["1-32"].initial = true;
            _HexMap["1-32"].player = 2;
        break;
      /*  case 3:
        break;
        case 4:
        break;
        case 5:
        break;
        case 6:
        break;
        case 7:
        break;
        case 8:
        break;*/
        default:
    }
}