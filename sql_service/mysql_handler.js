var mysql = require('mysql');
var Comm = require('../libs/communication');

var pool = mysql.createPool({
    host: 'localhost',
    user: process.argv[2],
    password: process.argv[3],
    database: 'dota2',
    connectionLimit: 1
});

var registry = {};

registry.insert_matches = function(match_pool) {
  var temp_str = '';
  for (var i = 0; i < match_pool.length - 1; i++) {
    temp_str = temp_str + '(' + match_pool[i] + '),';
  }
  temp_str = temp_str + '(' + match_pool[match_pool.length - 1] + ')';
  console.log(temp_str);
  query_helper(
    'insert test_matches (match_id) values' + temp_str,
    function (error, _, _) {
      if (error) throw error;
    }
  );
};

registry.record_failure = function () {
  query_helper.query(
    'insert test_success (success) values (0)',
    function (error, _, _f) {
      if (error) throw error;
    }
  );
};
var server = new Comm.Server((query, res) => {
  var parsed = JSON.parse(query);
  registry[parsed['query_type']](parsed['data']);
  console.log('[sql] Received by sql_proxy.');
  res.end();
});

server.listen(8081);

var query_helper = function(query_str, func) {
  var connect = function (pool) {
    pool.getConnection(function(err, connection) {
      if (err) {
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
          console.log('[DB] retrying connection');
          setTimeout(function () {
            connect(pool);
          }, 10000);
          return;
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
  connect(pool);
};

