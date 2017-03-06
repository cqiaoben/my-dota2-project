var Comm = require('./communication');

var Proxy = function (host) {
  this.host = host;
  this.conn = new Comm.Connection(this.host, 55555);
};

Proxy.prototype.insert_matches = function(query_data, func, err_func) {
  var query = JSON.stringify({
    data: query_data,
    query_type: 'insert_matches'
  });
  this.conn.send(query, (_) => {
    console.log('sent by proxy');
    func();
  }, err_func);
};

Proxy.prototype.get_max_seq_num = function(func, err_func) {
  var query = JSON.stringify({
    query_type: 'get_max_seq_num'
  });
  this.conn.send(query, (result) => {
    console.log('getting max seq num');
    func(result);
  }, err_func);
};

module.exports = Proxy;
