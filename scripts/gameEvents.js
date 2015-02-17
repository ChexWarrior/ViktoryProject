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
           gameBoard.createBoard();
           //game loop
           //while(!gameBoard.gameOver) {
           //     gameBoard.processRound();
           //     gameBoard.currentRound++;
           //}
        } 
    });
}