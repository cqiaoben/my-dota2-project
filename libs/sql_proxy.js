var Comm = require('./communication');

var conn = new Comm.Connection(host, 55555);

var Proxy = function (host) {
  this.host = host;
};

Proxy.prototype.insert_matches = function(matchpool) {
  var query = JSON.stringify({
    data: matchpool,
    query_type: 'insert_matches'
  });
  conn.send(query, (_) => {
    console.log('sent by proxy');
  });
};

module.exports = Proxy;
