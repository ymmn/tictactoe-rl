/**
 * sparse table
 * maps state and action to max reward
 */
function QTable(genInitValue) {
  var table = {};

  this.compute = function(state, move) {
    if (!table[state]) {
      table[state] = {};
    }

    if (!table[state][move]) {
      table[state][move] = genInitValue();
    }

    return table[state][move];
  };

  this.update = function(state, move, value) {
    if (!table[state]) {
      table[state] = {};
    }

    table[state][move] = value;
  };

  return this;
}


function QBot(_experiences, getAvailableMoves, hyperparams) {
  var exploreProbability = hyperparams.exploreProbability;
  if (!exploreProbability) {
    exploreProbability = 0;
  }

  var FUTURE_DISCOUNT_RATE = hyperparams.futureDiscountRate; //0.8;
  var LEARNING_RATE = hyperparams.learningRate; //0.5;
  var qTable = new QTable(function() {
    return 0.1 * Math.random() - 0.05;
  });

  /**
   * Update q-func based on experiences
   */
  this.update = function(experiences) {
    for (var i = 0; i < experiences.length; i++) {
      var curExp = experiences[i];

      var state = curExp[0];
      var nextState = curExp[1];
      var action = curExp[2];
      var reward = curExp[3];

      var futureReward = 0;
      if (nextState) {
        /* approximate reward with Bellman equation */
        var nextMoves = getAvailableMoves(nextState);
        for (var j = 0; j < nextMoves.length; j++) {
          futureReward = Math.max(
            futureReward,
            qTable.compute(nextState, nextMoves[j])
          )
        }
      }
      var adjustedReward = reward + (FUTURE_DISCOUNT_RATE * futureReward);

      var oldExpectedReward = qTable.compute(state, action);
      var newExpectedReward = oldExpectedReward + LEARNING_RATE * (adjustedReward - oldExpectedReward);

      qTable.update(state, action, newExpectedReward);
    }
  }

  /**
   * chooses based on max long-term reward
   */
  this.chooseMove = function(boardState, currentPlayer, availableMoves) {
    if (Math.random() < exploreProbability) {
      var randomIdx = ~~(Math.random() * availableMoves.length);
      return availableMoves[randomIdx];
    }

    var bestMove = availableMoves[0];
    var bestReward = qTable.compute(boardState, bestMove);

    for (var i = 1; i < availableMoves.length; i++) {
      var move = availableMoves[i];
      var reward = qTable.compute(boardState, move);

      if (reward >= bestReward) {
        bestReward = reward;
        bestMove = move;
      }
    }

    return bestMove;
  };

  this.update(_experiences);
}
