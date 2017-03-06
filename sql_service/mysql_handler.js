var mysql = require('mysql');
var Comm = require('../libs/communication');

console.log(process.argv);

var pool = mysql.createPool({
    host: 'localhost',
    user: process.argv[2],
    password: process.argv[3],
    database: 'dota2',
    connectionLimit: 1
});

var registry = {};

registry.insert_matches = (data, res) => {
  match_pool = data['match_pool'];
  seq_num = data['seq_num'];
  query_helper(
    [
      'insert test_matches (match_id) values :test_matches_items',
      'update seq set seq_num = :seq_num where seq_num < :seq_num'
    ],
    {
      test_matches_items: match_pool,
      seq_num: seq_num
    },
    // error handling or result handling
    function (error, _r, _f) {
      if (error) throw error;
    }
  );
  console.log('[sql] Received by sql_proxy.');
  res.end();
};

registry.get_max_seq_num = (_, res) => {
  query_helper(
    [
      'select seq_num from seq limit 1'
    ],
    {},
    function (_, results, _) {
      var seq_num = results[0].seq_num;
      seq_num = seq_num.toString();
      res.write(seq_num);
      console.log('[sql] Max seq number ' + seq_num + ' sent by sql_proxy');
      res.end();
    } 
  );
};

var server = new Comm.Server((query, res) => {
  var parsed = JSON.parse(query);
  registry[parsed['query_type']](parsed['data'], res);
});

server.listen(55555);

var query_helper = function(query_strs, args, func) {
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
      connection.config.queryFormat = function (query, values) {
        if (!values) return query;
        return query.replace(/\:(\w+)/g, function (txt, key) {
          if (values.hasOwnProperty(key)) {
             if (!Array.isArray(values[key])) {
               return this.escape(values[key]);
             }
             // If the escaped elem is an array, aggregate it
             var str = '';
             values[key].forEach(function(elem) {
               str += ' (' + this.escape(elem) + '),';
             });
             return str.substr(0, str.length - 1);
          }
          return txt;
        }.bind(this));
      };
      connection.beginTransaction((err) => {
        if (err) { throw err; }
        var query_factory = (query_strs, args, func) => {
          connection.query(
            query_strs.shift(),
            args,
            (err, results, fields) => {
              if (query_strs.length == 0) {
                connection.release();
              }
              if (err) {
                connection.rollback(() => {
                  throw err;
                });
              }
              func(err, results, fields);
              if (query_strs.length == 0) return;
              query_factory(query_strs, args, func);
            }
          );
        };
        query_factory(query_strs, args, func);
      });
    });
  };
  // connect
  connect(pool);
};

