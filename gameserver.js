const http = require('http');
const fs = require('fs');
const TicTacToe = require('./tictactoe');
const EventEmitter = require('events');

let pathRequestHandler = new EventEmitter();
let games = {};
let gameId = 1000;

const isFile = function(fileName) {
  return fs.existsSync(fileName);
}

const getHeader = function(fileName) {
  let ext = fileName.slice(fileName.lastIndexOf('.'));
  let headers = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.js': 'text/javascript'
  }
  return headers[ext];
}

const getFileContent = function(fileName) {
  return fs.readFileSync(fileName);
}

const setHeader = function(res, url) {
  let header = getHeader(url);
  if (header)
    res.setHeader('Content-Type', header);
}

const separatePath = function(url) {
  let paths = url.split('/');
  return paths.filter((path) => path !== '');
}

const updateMove = function(gameId,move,address){
  let game = games[gameId];
  if(game && !game.isMoveAlreadyPresent(move)){
    if(game.computers[game.currentPlayerIndex] == address)
      game.updateMove(move);
  }
}

const addNewPlayer = function (gameId,address) {
  let game = games[gameId];
  if(game && game.computers.length <2){
    game.computers.push(address);
    return true;
  }
  return false;
}

const startNewGame = function (address) {
  games[++gameId] = new TicTacToe();
  games[gameId].computers.push(address);
  return gameId;
}

const deleteGameIfFinished = function(status, gameId){
  if(status !== 'inplay'){
    setTimeout(()=>delete(games[gameId]), 60000);
  }
};

const getGameData = function(gameId){
  let game = games[gameId];
  if(!game){
    return 'alert("No Game Running With This GameId")';
  }
  let data = JSON.parse(JSON.stringify(game));
  data.status = game.getStatus();
  deleteGameIfFinished(data.status, gameId);
  return JSON.stringify(data);
}

const redirectTo = function (res,url) {
  res.statusCode = 302;
  res.setHeader('Location',url)
}

//requestHandlers for every path
const requestHandler = function(req, res) {
  // console.log(req.url);
  let url = req.url == '/' ? 'index.html' : req.url;
  let paths = separatePath(url);
  paths.forEach((path) => {
    if (isFile(path))
      pathRequestHandler.emit('file', res, path);
    else
      pathRequestHandler.emit(path,req, res);
  });
  res.end();
}

pathRequestHandler.on('file', function(res, fileName) {
  let pageContent = getFileContent(fileName);
  setHeader(res, fileName);
  res.write(pageContent);
});

pathRequestHandler.on('startgame',function (req, res) {
  let deviceAddress = req.connection.remoteAddress;
  let newGameId = startNewGame(deviceAddress);
  redirectTo(res,`${newGameId}/game`);
});

pathRequestHandler.on('game',function (req,res) {
  pathRequestHandler.emit('file',res,'game.html');
});

pathRequestHandler.on('data',function (req,res) {
  let gameId = req.url.match(/[\d]+/g)[0];
  let data = getGameData(gameId);
  setHeader(res,'data.js');
  res.write(data);
});

pathRequestHandler.on('move',function (req,res) {
  let gameInfo = req.url.match(/[\d]+/g);
  let gameId = +gameInfo[0];
  let movePos = +gameInfo[1];
  let deviceAddress = req.connection.remoteAddress;
  updateMove(gameId,movePos,deviceAddress);
});

pathRequestHandler.on('join',function (req,res) {
  let gameId = req.url.match(/[\d]+/)[0];
  let deviceAddress = req.connection.remoteAddress;
  let added = addNewPlayer(gameId,deviceAddress);
  if(added){
    redirectTo(res,`/${gameId}/game`)
  } else {
    res.write('Maximum Players limit reached');
  }
});

const server = http.createServer(requestHandler);
server.listen(9999);
