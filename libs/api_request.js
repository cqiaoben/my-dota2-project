var https = require('https');

var User = function(key) {
  this.options = {
    host: 'api.steampowered.com',
    path_pre: ('/IDOTA2Match_570/GetMatchHistoryBySequenceNum/v1/'
        + '?key=' + key
        + '&start_at_match_seq_num='),
    path_post: '&matches_requested=100'
  };
};

User.prototype.request = function(seq_num, func) {
  this.options.path = this.options.path_pre + seq_num + this.options.path_post;
  console.log('[api] ' + this.options.path);
  https.request(this.options, function(response) {
    var str = '';

    //another chunk of data has been received, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });

    //the whole response has been received, so we just print it out here
    response.on('end', function () {
      func(str);
    });

    response.on('error', function(e) {
      console.log(e);
    });
  }).end();
};

var validate_match = function(match) {
  var count = 0;
  var detecting_pool = {1:1, 2:1, 3:1, 4:1, 16:1, 22:1};
  var lobby_type = match['lobby_type'];
  if (lobby_type != 0 && lobby_type != 1 && lobby_type != 7) {
    return false;
  }
  var game_mode = match['game_mode'];
  if (!(game_mode in detecting_pool)) {
    return false;
  }
  if (match['human_players'] != 10) {
    return false;
  }
  return true;
};

module.exports = {
  User: User,
  validate_match: validate_match
};
