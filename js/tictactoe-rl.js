/**
 * Picks random legal moves
 */
function RandomBot() {
  this.chooseMove = function(_, _, availableMoves) {
    var randomIdx = ~~(Math.random() * availableMoves.length);
    return availableMoves[randomIdx];
  };
}

/**
 * Prevents immediate losses and goes for immediate wins
 * Random otherwise
 */
function ReflexiveBot() {
  this.chooseMove = function(boardState, currentPlayer, availableMoves) {
    // Pick immediate win if available
    for (var i = 0; i < availableMoves.length; i++) {
      var move = availableMoves[i];

      var newBoardArr = boardState.split('');
      newBoardArr[move] = currentPlayer;

      var newBoardState = newBoardArr.join('');
      if (TicTacToe.getWinner(newBoardState)) {
        return move;
      }
    }

    // Block immediate loss if available
    for (var i = 0; i < availableMoves.length; i++) {
      var move = availableMoves[i];

      var newBoardArr = boardState.split('');
      newBoardArr[move] = currentPlayer === 'X' ? 'O' : 'X';

      var newBoardState = newBoardArr.join('');
      if (TicTacToe.getWinner(newBoardState)) {
        return move;
      }
    }

    var randomIdx = ~~(Math.random() * availableMoves.length);
    return availableMoves[randomIdx];
  };
}


/**
 * swap all X's with O's in a board string
 */
function flipPlayers(boardState) {
  var swapMap = {X: 'O', O: 'X', '-': '-'};
  return boardState
    .split('')
    .map(function(c) { return swapMap[c]; })
    .join('')
}


/**
 * Plays a full game of TicTacToe, and then returns
 * an array of experiences
 *
 * each experience is a tuple of (state, nextState, action, reward)
 */
function playGame(bot1, bot2) {
  var tictactoe = new TicTacToe();
  var experiences = [];

  var turnIdx = 0;
  while (!tictactoe.isGameOver()) {
    var currentState = tictactoe.getBoardState();
    var currentPlayer = tictactoe.getCurrentPlayer();
    var bot = currentPlayer === 'X' ? bot1 : bot2;

    // for simplicity, make bots always play as X
    if (currentPlayer === 'O') {
      currentState = flipPlayers(currentState);
    }
    var chosenMove = bot.chooseMove(
      currentState,
      'X',
      TicTacToe.getAvailableMoves(currentState)
    );
    tictactoe.playMove(chosenMove);

    // 1 if won
    // 0 if tie
    // -1 if lost
    var winner = tictactoe.getWinner();
    var reward;
    if (winner === null) {
      reward = 0;
    } else if (winner === currentPlayer) {
      reward = 1;
    } else {
      reward = -1;
    }

    // normalize the experience so it's always from X's POV
    var normalizedExp = [currentState, null, chosenMove, reward];
    if (currentPlayer === 'O') {
      normalizedExp = [flipPlayers(currentState), null, chosenMove, reward];
    }

    experiences.push(normalizedExp);
    // populate nextState from 2 turns ago
    if (turnIdx >= 2) {
      experiences[turnIdx - 2][1] = normalizedExp[0];
    }

    turnIdx++;
  }

  // populate other player's experience and reward
  var lastExp = experiences[experiences.length - 1];
  experiences[turnIdx - 2][1] = lastExp[0];
  experiences[turnIdx - 2][3] = lastExp[3] * -1;

  return experiences;
}

var NUM_EVALUATION_GAMES = 1000;
var EXPLORE_PROBABILITY = 0.5;
var LEARNING_RATE = 0.5;
var FUTURE_DISCOUNT_RATE = 0.8;


function buildQbot(exp, exploreProbability) {
  return new QBot(
    exp,
    TicTacToe.getAvailableMoves,
    {
      exploreProbability: exploreProbability,
      learningRate: LEARNING_RATE,
      futureDiscountRate: FUTURE_DISCOUNT_RATE,
    }
  )
}

function init() {
  var tictactoe = new TicTacToe();
  var accumulatedExp = [];
  var qBot = buildQbot(accumulatedExp, EXPLORE_PROBABILITY);
  var trainingBots = [qBot, new ReflexiveBot];
  var trainInterval;


  var onTrainOptionsChange = function(evt) {
    trainingBots = evt.target.value.split('-').map(function(s) {
      if (s === 'q') {
        return qBot;
      } else if (s === 'reflexive') {
        return new ReflexiveBot();
      } else if (s === 'random') {
        return new RandomBot();
      }
    })
  };

  var onTrainClick = function() {
    var isTraining = trainInterval != null;

    if (!isTraining) {
      var bot1 = trainingBots[0];
      var bot2 = trainingBots[1];

      trainInterval = setInterval(function() {
        var exp = playGame(bot1, bot2);
        accumulatedExp = accumulatedExp.concat(exp);
        qBot.update(exp);
        renderBotStatus(accumulatedExp);
      }, 0);
    } else {
      clearInterval(trainInterval);
      trainInterval = null;
      renderBotStatus(accumulatedExp);
    }
  };

  var onEvaluateClick = function() {
    botEvaluationContainer.empty();

    var evaluationBot = buildQbot(accumulatedExp);
    var opponentBots = [
      new RandomBot(),
      new ReflexiveBot(),
      evaluationBot,
    ];
    var allResults = {};

    for (var j = 0; j < opponentBots.length; j++) {
      var bot1 = evaluationBot;
      var bot2 = opponentBots[j];

      var res = { wins: 0, ties: 0, losses: 0  };
      for (var i = 0; i < NUM_EVALUATION_GAMES; i++) {
        var exp = playGame(bot1, bot2);

        var isTie = exp[exp.length - 1][3] === 0;
        if (isTie) {
          res.ties += 1;
        } else if (exp.length % 2 === 1) {
          res.wins += 1;
        } else {
          res.losses += 1;
        }
      }

      allResults[bot2.constructor.name] = res;
    }

    renderBotEvaluation(allResults);
  };

  registerListeners({
    onEvaluateClick: onEvaluateClick,
    onTrainClick: onTrainClick,
    onTrainOptionsChange: onTrainOptionsChange,
  });
  renderBotStatus(accumulatedExp);
}

init();
