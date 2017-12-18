const isSubset = function(list1, list2) {
  return list2.every(function(num) {
    return list1.includes(num);
  });
}

const Player = function(name, symbol, color) {
  this.name = name;
  this.symbol = symbol;
  this.moves = [];
  this.color = color;
}

const Game = function() {
  this.players = [];
  this.currentPlayerIndex = 0;
  let p1 = new Player("player1", "X", "red");
  let p2 = new Player("player2", "O", "darkblue");
  this.computers = [];
  this.players.push(p1);
  this.players.push(p2);
}

Game.prototype.updateMove = function(position) {
  let player = this.players[this.currentPlayerIndex];
  player.moves.push(+position);
  this.currentPlayerIndex = 1 - this.currentPlayerIndex;
}

Game.prototype.hasPlayerWon = function() {
  let player = this.players[1 - this.currentPlayerIndex];
  let winsets = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 5, 9],
    [3, 5, 7],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9]
  ];
  let moves = player.moves;
  return winsets.some(function(winset) {
    return isSubset(moves, winset);
  });
}

Game.prototype.isMoveAlreadyPresent = function(position) {
  let p1Moves = this.players[0].moves;
  let p2Moves = this.players[1].moves;
  let totalMovesMade = p1Moves.concat(p2Moves);
  return totalMovesMade.includes(position);
}

Game.prototype.getStatus = function() {
  if (this.hasPlayerWon()) {
    return `Player ${2-this.currentPlayerIndex} Won`;
  }
  if (this.hasGameDrawn()) {
    return 'Game Draw';
  }
  return 'inplay';
}

Game.prototype.hasGameDrawn = function() {
  let p1Moves = this.players[0].moves;
  let p2Moves = this.players[1].moves;
  let totalMovesMade = p1Moves.concat(p2Moves);
  return totalMovesMade.length == 9;
}

module.exports = Game;
