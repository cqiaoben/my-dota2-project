var Api = require('../libs/api_request');
var Proxy = require('../libs/sql_proxy');
var Comm = require('../libs/communication');

console.log(process.argv);

var user = new Api.User('DB68D75E77E22C0888179CB78F0BF3C9');
var validate_match = Api.validate_match;
var proxy = new Proxy(process.argv[3]);
var backup_connection = new Comm.Connection(process.argv[2], 12345);
var salt_connection = new Comm.Connection(process.argv[4], 8002);

var match_seq_num;
var start = () => {
  proxy.get_max_seq_num(
    function(result) {
      match_seq_num = result;
      timer();
    },
    (_) => {
      setTimeout(start, 5000);
    }
  );
};

var timer = () => {
  setTimeout(() => {
    user.request(match_seq_num, (str) => {
      parse_and_send(str);
    });
  }, 5000);
};

var parse_and_send = (str) => {
  var match_pool = [];
  var json;
  try {
    json = JSON.parse(str);
  } catch (e) {
    backup_connection.send(
      JSON.stringify(match_seq_num),
      (match_seq) => {
        console.log(match_seq);
        match_seq_num = JSON.parse(match_seq);
        timer();
      },
      (_) => {
        timer();
      }
    );
    return;
  }
  if (json['result']['status'] == 0) {
    return;
  }
  var count = 0;
  var max_seq_num = match_seq_num;
  json['result']['matches'].forEach((match) => {
    if (max_seq_num <= match['match_seq_num']) {
      max_seq_num = match['match_seq_num'] + 1;
    }
    if (!validate_match(match)) {
      return;
    }
    match_pool.push(match['match_id']);
    count++;
  });
  // send result to db
  proxy.insert_matches(
    {
      'match_pool': match_pool,
      'seq_num': max_seq_num
    },
    () => {
      match_seq_num = max_seq_num;
      salt_connection.send(
        JSON.stringify(match_pool),
        // success
        (_) => {
          timer();
        },
        // failure
        () => {
          timer();
        }
      );
    },
    (_) => {
      timer();
    }
  );
  console.log(count);
};

start();
