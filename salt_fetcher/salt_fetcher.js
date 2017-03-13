var Steam = require('steam');
var dota2 = require('dota2');

console.log(process.argv);

var Comm = require('../libs/communication');
var spawn_server = function() {
  var server = new Comm.Server((data, res) => {
    var match_pool = JSON.parse(data);
    match_pool.forEach((elem) => {
      if (Math.random() > 0.1) return; // parse 10%
      var handler = handler_queue.shift();
      if (!handler) {
        mid_queue.push(elem);
      } else {
        handler(elem);
      }
    });
    res.end();
  });
  server.listen(55554);
};

var accounts = [];
for (var i = 200; i < 400; i++) {
  accounts.push(i);
}

var active_accounts = [];
var handler_queue = []; // idle connection to handle mid
var mid_queue = [];  // mids waiting for idle connections
var count = 0;

var get_salt = function(match, Dota2) {
  var timeout_status = 0;
  Dota2.requestMatchDetails(match, function(err, body) {
    timeout_status = 1;
    if (err) {
      console.log(err);
    } else {
      console.log(body.match.replay_salt);
    }
  });

  setTimeout(function() {
    if (timeout_status) {
      return;
    }
    process.exit();
  }, 5000);
};
  
var iter_salt = function(Dota2) {
  var mid = mid_queue.shift();
  if (mid) {
    setTimeout(function() {
      get_salt(mid, Dota2);
    }, 5000);
    iter_salt(Dota2);
  } else {
    // spawn handler
    var handler = function(mid) {
      setTimeout(function() {
        get_salt(mid, Dota2);
      }, 5000);
      iter_salt(Dota2);
    };
    handler_queue.push(handler);
  }
}; 

var spawn_client = function () {
  var i = accounts.shift();
  if (!i) {
    console.log('[FATAL] out of clients');
    process.exit();
  }
  var steamClient = new Steam.SteamClient();
  var steamUser = new Steam.SteamUser(steamClient);
  var Dota2 = new dota2.Dota2Client(steamClient, false, false);
  var num = ('000' + i).slice(-3);
  var steam_user = 'vp' + num + 'game';
  var steam_pass = 'VPgame' + num;
  var logOnDetails = {
    'account_name': steam_user,
    'password': steam_pass,
  };

  var onSteamLogOn = function onSteamLogOn(logonResp) {
    count += 1;
    if (logonResp.eresult == Steam.EResult.OK) {
      Dota2.launch();
      Dota2.on('ready', function() {
        iter_salt(Dota2);
      });
    } else {
      console.log('failed ' + i);
    }
  };

  var onSteamError = function onSteamError(error) {
    console.log('Connection closed by server: '+error);
  };
  steamClient.connect();
  steamClient.on('connected', function() {
    steamUser.logOn(logOnDetails);
  });
  steamClient.on('logOnResponse', onSteamLogOn);
  steamClient.on('error', onSteamError);
};

spawn_server();
for (var i = 0; i < 100; i++) {
  spawn_client();
}
