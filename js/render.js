var evaluateBotBtn = $('#evaluate-bot');
var trainBtn = $('#train');
var botStatusContainer = $('#bot-training-status');
var botEvaluationContainer = $('#bot-evaluation');
var trainingOptionsDropdown = $('#training-options');


function renderBotEvaluation(results) {
  var botNames = Object.keys(results);
  var totalReward = 0;

  var htmlStr = '';
  for (var i = 0; i < botNames.length; i++) {
    var res = results[botNames[i]]
    htmlStr += (
      '<div>' +
      'Vs ' + botNames[i] + ': ' +
      JSON.stringify(res) +
      '</div>'
    );
    totalReward += res.wins - res.losses;
  }
  htmlStr += '<div>Total Reward (wins - losses): ' + totalReward + '</div>';

  botEvaluationContainer.html(htmlStr);
}

function renderBotStatus(botExp) {
  var uniqueBoards = {};
  botExp.forEach(function(e) { uniqueBoards[e[0]] = uniqueBoards[e[0]] ? uniqueBoards[e[0]] + 1 : 1; });
  var numUniqueBoards = Object.keys(uniqueBoards).length;
  var numMatches = botExp.filter(function(e) { return e[0] === '---------'; }).length;

  // console.log(uniqueBoards);
  botStatusContainer.html(
    '<div>Accumulated ' +
    botExp.length + ' experiences, seen ' +
    numUniqueBoards + ' unique boards, in ' +
    numMatches + ' matches</div>'
  );
}


function registerListeners(listeners) {
  trainingOptionsDropdown.change(listeners.onTrainOptionsChange);
  trainBtn.click(listeners.onTrainClick);
  evaluateBotBtn.click(listeners.onEvaluateClick);
}
