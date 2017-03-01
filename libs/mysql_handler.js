var mysql = require('mysql');

var Handler = function () {
  this.pool = mysql.createPool({
    host: /*'104.197.102.56',*/'127.0.0.1',
    user: 'cs193s',
    password: 'cs193s',
    database: 'dota2',
    connectionLimit: 1
  });
};

Handler.prototype.query = function(query_str, func) {
  var connect = function (pool) {
    pool.getConnection(function(err, connection) {
      if (err) {
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
          console.log('[DB] retrying connection');
          setTimeout(connect, 10000);
        } else {
          throw err;
        }
      }
      connection.query(query_str, function (err, results, fields) {
        connection.release();
        func(err, results, fields);
      });
    });
  };
  // connect
  connect(this.pool);
};

Handler.prototype.insert_matches = function(match_pool) {
  var temp_str = '';
  for (var i = 0; i < match_pool.length - 1; i++) {
    temp_str = temp_str + '(' + match_pool[i] + '),';
  }
  temp_str = temp_str + '(' + match_pool[match_pool.length - 1] + ')';
  console.log(temp_str);
  this.query(
    'insert test_matches (match_id) values' + temp_str,
    function (error, _, _) {
      if (error) throw error;
    }
  );
};

Handler.prototype.record_failure = function () {
  this.query(
    'insert test_success (success) values (0)',
    function (error, _, _) {
      if (error) throw error;
    }
  );
};

module.exports = Handler;
