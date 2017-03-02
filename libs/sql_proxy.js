var Comm = require('./communication');

var Proxy = function (host) {
  this.host = host;
  this.conn = new Comm.Connection(this.host, 8090);
};

Proxy.prototype.insert_matches = function(matchpool) {
  var query = JSON.stringify({
    data: matchpool,
    query_type: 'insert_matches'
  });
  this.conn.send(query, (_) => {
    console.log('sent by proxy');
  });
};

module.exports = Proxy;
