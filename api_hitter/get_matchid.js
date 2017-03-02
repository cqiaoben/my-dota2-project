var Api = require('../libs/api_request');
var Proxy = require('../libs/sql_proxy');
var Comm = require('../libs/communication');

var user = new Api.User('DB68D75E77E22C0888179CB78F0BF3C9');
var validate_match = Api.validate_match;
var proxy = new Proxy(process.argv[3]);
var connection = new Comm.Connection(process.argv[2], 8080);

var match_seq_num = 2642108334;

var timer = () => {
  setTimeout(() => {
    user.request(match_seq_num, (str) => {
      parse_and_send(str);
      timer();
    });
  }, 5000);
};

var parse_and_send = (str) => {
  var match_pool = [];
  var json;
  try {
    json = JSON.parse(str);
  } catch (e) {
    connection.send(
      JSON.stringify(match_seq_num),
      (match_seq) => {
        console.log(match_seq);
        match_seq_num = JSON.parse(match_seq);
      }
    );
    return;
  }
  if (json['result']['status'] == 0) {
    return;
  }
  var count = 0;
  json['result']['matches'].forEach((match) => {
    if (match_seq_num <= match['match_seq_num']) {
      match_seq_num = match['match_seq_num'] + 1;
    }
    if (!validate_match(match)) {
      return;
    }
    match_pool.push(match['match_id']);
    count++;
  })
  // send result to db
  proxy.insert_matches(match_pool);
  console.log(count);
}

timer();
