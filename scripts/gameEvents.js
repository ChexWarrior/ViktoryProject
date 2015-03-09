$(document).ready(function() {
    (function() {
        $("#numPlayersSelect").on("change", function() {
            if($(this).val() !== "") {
               var boardElement = Snap("#board");
               $(".hex, .hexContainer").remove();
               var gameBoard = new Board(boardElement, parseInt($(this).val(), 10));
               $("#playerTurnIndicator").html("Player Turn: 1");
               $("#endTurnBtn").on("click", function() {
                    gameBoard.changeTurn();
               });
               $("#undoBtn").on("click", function() {
                    gameBoard.undoLastAction();
               });
               gameBoard.createBoard();
               gameBoard.processPlayerTurn();
            }
        });
    }());
});