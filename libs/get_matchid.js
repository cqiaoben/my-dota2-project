var https = require('https');
var Handler = require('./mysql_handler');
var mysql_handler = new Handler();
var options = {
  host: 'api.steampowered.com',
  path_pre: ('/IDOTA2Match_570/GetMatchHistoryBySequenceNum/v1/'
      + '?key=987205C8EF565CB4208D3B9235C40190'
      + '&start_at_match_seq_num='),
  path_post: '&matches_requested=100'
};

var match_seq_num = 2642108334;

var timer = function () {
  setTimeout(function () {
    options.path = options.path_pre + match_seq_num + options.path_post;
    console.log('[api] ' + options.path);
    https.request(options, callback).end();
  }, 5000);
};

var parseAndSend = function(str) {
  var match_pool = [];
  var json;
  try {
    json = JSON.parse(str);
  } catch (e) {
    // usually too many requests.
    mysql_handler.record_failure(); 
    return false;
  }
  if (json['result']['status'] == 0) {
    return false;
  }
  var count = 0;
  var detecting_pool = {1:1, 2:1, 3:1, 4:1, 16:1, 22:1};
  json['result']['matches'].forEach(function(match) {
    if (match_seq_num <= match['match_seq_num']) {
      match_seq_num = match['match_seq_num'] + 1;
    }
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
    match_pool.push(match['match_id']);
    count++;
  })
  // send result to db
  mysql_handler.insert_matches(match_pool);
  console.log(count);
}

var callback = function(response) {
  var str = '';

  //another chunk of data has been received, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been received, so we just print it out here
  response.on('end', function () {
    parseAndSend(str);
    timer();
  });

  response.on('error', function(e) {
    console.log(e);
  });
}

timer();
