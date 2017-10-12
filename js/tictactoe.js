function TicTacToe() {
  var boardState = '---------'.split('');
  var currentPlayer = 'X';

  this.getBoardState = function() {
    return boardState.join('');
  }

  this.getCurrentPlayer = function() {
    return currentPlayer;
  }

  this.playMove = function(moveIdx) {
    boardState[moveIdx] = currentPlayer;
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  }

  this.getWinner = function() {
    return TicTacToe.getWinner(boardState);
  }

  this.isGameOver = function() {
    var boardIsFull = boardState.filter(function(c) { return c === '-'; }).length === 0;
    return this.getWinner() || boardIsFull;
  }
}

TicTacToe.getAvailableMoves = function(boardState) {
  var res = [];
  for (var i = 0; i < boardState.length; i++) {
    if (boardState[i] === '-') {
      res.push(i);
    }
  }
  return res;
}

TicTacToe.getWinner = function(boardState) {
  var triples = [
    // horizontal
    [boardState[0], boardState[1], boardState[2]],
    [boardState[3], boardState[4], boardState[5]],
    [boardState[6], boardState[7], boardState[8]],

    // vertical
    [boardState[0], boardState[3], boardState[6]],
    [boardState[1], boardState[4], boardState[7]],
    [boardState[2], boardState[5], boardState[8]],

    // diagonal
    [boardState[0], boardState[4], boardState[8]],
    [boardState[2], boardState[4], boardState[6]],
  ]

  for (var i = 0; i < triples.length; i++) {
    var triple = triples[i];
    if (triple[0] === triple[1] && triple[1] === triple[2] && triple[0] !== '-') {
      return triple[0];
    }
  }

  return null;
}
