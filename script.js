var refresh;
let symbols = ['X', 'O'];
var gameData = "";

const showDraw = function() {
  updateDisplay("Game Drawn");
}

const fillData = function() {
  let boxes = document.getElementsByClassName('box');
  gameData.players[0].moves.forEach((pos) =>
    boxes[pos - 1].innerText = symbols[0]
  );
  gameData.players[1].moves.forEach((pos) =>
    boxes[pos - 1].innerText = symbols[1]
  );
  updateDisplay(gameData.status);
}

const isMoveAlreadyPresent = function(position) {
  let p1Moves = gameData.players[0].moves;
  let p2Moves = gameData.players[1].moves;
  let totalMovesMade = p1Moves.concat(p2Moves);
  return totalMovesMade.includes(position);
};

const refreshBoard = function() {
  let request = new XMLHttpRequest();
  request.open('get', 'data');
  request.onreadystatechange = function(data) {
    if(request.readyState != 4)
      return;
    gameData = JSON.parse(data.target.responseText);
    fillData();
    if (gameData.status !== "inplay") {
      stopGame();
    };
  };
  request.send();
}

const sendMove = function(movePos) {
  let request = new XMLHttpRequest();
  request.open('get', 'move/' + movePos);
  request.onreadystatechange = refreshBoard;
  request.send();
}

const actionOnClick = function(event) {
  let position = getMove(event);
  if (!isMoveAlreadyPresent(position)) {
    sendMove(position);
    // window.location = 'move/' + position;
  }
}

const updateDisplay = function(text) {
  let display = document.getElementById("display");
  display.innerText = text;
}

const getMove = function(event) {
  let cell = event.target.id;
  return +cell;
}

const stopGame = function() {
  let gameBoard = document.getElementById("gameBoard");
  gameBoard.onclick = null;
  clearInterval(refresh);
}

const startGame = function() {
  window.location = '/startgame';
}

let init = function() {
  let gameBoard = document.getElementById('gameBoard');
  refresh = setInterval(() => refreshBoard(), 500)
  gameBoard.onclick = actionOnClick;
}

window.onload = init;
