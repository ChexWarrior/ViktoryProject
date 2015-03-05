$(document).ready(function() {
    (function() {
        $("#numPlayersSelect").on("change", function() {
            if($(this).val() !== "") {
               var boardElement = Snap("#board");
               $(".hex").remove();
               var gameBoard = new Board(boardElement, parseInt($(this).val(), 10));
               $("#playerTurnIndicator").html("Player Turn: 1");
               $("#endTurnBtn").on("click", function() {
                    gameBoard.changeTurn();
               });
               gameBoard.createBoard();
               gameBoard.determineStartingHexes();
               gameBoard.processPlayerTurn();
            }
        });
    }());
});