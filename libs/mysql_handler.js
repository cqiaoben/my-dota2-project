var mysql = require('mysql');

var Handler = function () {
};

Handler.prototype.query = function(query_str, func) {
    var con = mysql.createConnection({
      host: '104.197.102.56',//'127.0.0.1',
      user: 'cs193s',
      password: 'cs193s',
      database: 'dota2',
      connectionLimit: 50,
      useTransaction: {
         connectionLimit: 20
      }
    });

    con.connect(function(err) {
      if (err) {
        console.log('[Db] Error connecting to Db');
        return;
      }
      console.log('[Db] Connection established');
    });
    
    con.query(query_str, func);

    con.end(function(err) {
      // The connection is terminated gracefully
      // Ensures all previously enqueued queries are still
      // before sending a COM_QUIT packet to the MySQL server.
    });
};

Handler.prototype.insert_matches = function(match_pool) {
    var temp_str = '';
    for (var i = 0; i < match_pool.length - 1; i++) {
      temp_str = temp_str + '(' + match_pool[i] + '),';
    }
    temp_str = temp_str + '(' + match_pool[match_pool.length - 1] + ')';
    console.log(temp_str);
    try {
      this.query(
        'insert test_matches (match_id) values' + temp_str,
        function (error, _, _) {
          if (error) throw error;
        }
      );
    } catch (e) {
       console.log(e);
    }
};

Handler.prototype.record_failure = function() {
    try {
      this.query(
        'insert test_success (success) values (0)',
        function (error, _, _) {
          if (error) throw error;
        }
      );
    } catch (e) {
       console.log(e);
    }
};

module.exports = Handler;
