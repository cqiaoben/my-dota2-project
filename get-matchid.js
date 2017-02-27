var http = require('http');
var options = {
  host: 'api.steampowered.com',
  path: ('/IDOTA2Match_570/GetMatchHistoryBySequenceNum/v1/'
      + '?key=987205C8EF565CB4208D3B9235C40190'
      + '&start_at_match_seq_num=300100000&matches_requested=100')
};

var parseAndSend = function(str) {
  var json = JSON.parse(str);
  if (json['result']['status'] == 0) {
    return false;
  }
  var count = 0;
  var detecting_pool = {1:1, 2:1, 3:1, 4:1, 16:1, 22:1};
  json['result']['matches'].forEach(function(match) {
    var lobby_type = match['lobby_type'];
    if (lobby_type != 0 && lobby_type != 1 && lobby_type != 7) {
      return;
    }
    var game_mode = match['game_mode'];
    if (!(game_mode in detecting_pool)) {
      return;
    }
    //console.log(match);
    if (match['human_players'] != 10) {
      return;
    }
    count++;
  })
  console.log(count);
}

var callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    parseAndSend(str);
  });

  response.on('error', function(e) {
    console.log(e);
  });
}

var num_req = 5;

var request_func = function() {
  http.request(options, callback).end();
  if (num_req == 0) {
    return;
  }
  num_req = num_req - 1;
  iter_func();
}

iter_func = function() {
  setTimeout(request_func, 5000);
};

iter_func();

