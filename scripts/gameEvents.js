$(document).ready(function() {
    attachDOMEvents();    
});

function attachDOMEvents() {
    //num players DDL
    $("#numPlayersSelect").on("change", function() {
        if($(this).val() != "") {

           var boardElement = Snap("#board");
           $(".hex").remove();
           var gameBoard = new Board(boardElement, parseInt($(this).val(), 10));
           $("#playerTurnIndicator").html("Player Turn: 1");
           gameBoard.createBoard();
           $("#playerTurnIndicator").on("click", function() {
              gameBoard.changeTurn();
           });
           gameBoard.determineStartingHexes();
           gameBoard.processRound();
        }

    });
}