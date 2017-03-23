var Steam = require('steam');
var dota2 = require('dota2');
var request = require('request');

console.log(process.argv);

var Comm = require('../libs/communication');
var spawn_server = function() {
  var server = new Comm.Server((data, res) => {
    var match_pool = JSON.parse(data);
    match_pool.forEach((elem) => {
      if (Math.random() > 0.03) return; // parse 3%
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

var c_exit = function() {
  var api_url = 'http://localhost:8001/apis/extensions/v1beta1/namespaces/default/deployments/salt';
  var annotation_path = '/metadata/annotations/federation.kubernetes.io~1deployment-preferences';
  var gen_cluster = function(clusters) {
    var current_clusters = JSON.parse(clusters).clusters;
    var current_cluster = Object.keys(current_clusters)[0];
    var next_cluster = {
      'cluster-asia-east1-a': 'cluster-us-east1-b',
      'cluster-europe-west1-b': 'cluster-asia-east1-a',
      'cluster-us-east1-b': 'cluster-europe-west1-b',
    };
    if (current_clusters[current_cluster]['minReplicas'] == 1) {
      current_clusters[next_cluster[current_cluster]] = current_clusters[current_cluster];
      current_clusters.delete(current_cluster);
    } else {
      current_clusters[current_cluster]['minReplicas'] -= 1;
      current_clusters[current_cluster]['maxReplicas'] -= 1;
    }
    return current_clusters;
  };

  var update_annotation = function(old_body) {
    var clusters = old_body;
    var new_annotation = gen_cluster(clusters);
    var request_body = JSON.stringify([
      {'op': 'test', 'path': annotation_path, 'value': old_body},
      {'op': 'replace', 'path': annotation_path, 'value': new_annotation}
    ]);
    request({
      headers: {'Content-Type': 'application/json-patch+json'},
      url: api_url,
      method: 'PATCH',
      body: request_body
    }, function(e, r, b) {
      if (e) {
        console.log('fail');
        // Retry
        setTimeout(get_annotation, 5000);
        return;
      }
      if (r.statusCode == 200) {
        console.log('update succeed');
        process.exit();
      }
      setTimeout(get_annotation, 5000);
    });
  };
  
  var get_annotation = function() {
    request({
      headers: {'Content-Type': 'application/json-patch+json'},
      url: api_url,
      method: 'GET'
    }, function(e, r, b) {
      if (e) {
        console.log('fail');
        // Retry
        setTimeout(get_annotation, 5000);
        return;
      }
      try {
        var annotation = JSON.parse(b).metadata.annotations['federation.kubernetes.io/deployment-preferences'];
        update_annotation(annotation);
      } catch (e) {
        console.log(e);
      } 
    });
  };
  get_annotation();
};

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
    c_exit();
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
    c_exit();
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
for (i = 0; i < 100; i++) {
  spawn_client();
}
