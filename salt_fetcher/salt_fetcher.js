var Steam = require("steam");
var steamClient = new Steam.SteamClient();
var steamUser = new Steam.SteamUser(steamClient);
var dota2 = require('dota2');
var Dota2 = new dota2.Dota2Client(steamClient, true, false);

var Comm = require('../libs/communication');


var config = {};

config.steam_name = "";
config.steam_user = "vp005game";
config.steam_pass = "VPgame005";

global.config = config;

var onSteamLogOn = function onSteamLogOn(logonResp) {
    if (logonResp.eresult == Steam.EResult.OK) {
      console.log("Logged on.");
      Dota2.launch();
      Dota2.on("ready", function() {
        var server = new Comm.Server((match_pool, res) => {
          var match_pool = JSON.parse(match_pool);
          get_salt(match_pool, res);
        });

        server.listen(55554);
 
        console.log("Node-dota2 ready.");
 
        var get_salt = function(matches, res) {
          Dota2.requestMatchDetails(matches.shift(), function(err, body) {
            if (err) {
              console.log(err);
            } else {
              console.log(body.match.replay_salt);
            }
            setTimeout(function() {
            get_salt(matches, res);}, 5000
            );
          });
          if (matches.length == 0) {
            res.end();
          }
        };
      });
    }
   },

    onSteamError = function onSteamError(error) {
        console.log("Connection closed by server: "+error);
    };


var logOnDetails = {
    "account_name": global.config.steam_user,
    "password": global.config.steam_pass,
};

steamClient.connect();
steamClient.on('connected', function() {
    steamUser.logOn(logOnDetails);
});
steamClient.on('logOnResponse', onSteamLogOn);
steamClient.on('error', onSteamError);
