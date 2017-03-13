var Api = require('../libs/api_request');
var Proxy = require('../libs/sql_proxy');
var Comm = require('../libs/communication');

console.log(process.argv);

var user = new Api.User('987205C8EF565CB4208D3B9235C40190');
var validate_match = Api.validate_match;
var proxy = new Proxy(process.argv[2]);
var server = new Comm.Server((match_seq_number, response) => {
  user.request(match_seq_number, (str) => {
    parse_and_send(str, response, match_seq_number);
  });
  console.log('[backup] Received by backup.');
});

var parse_and_send = (str, response, match_seq_num) => {
  var match_pool = [];
  var json;
  try {
    json = JSON.parse(str);
  } catch (e) {
    console.log('[Backup] Too many requests');
    response.statusCode = 400;
    response.end();
    return;
  }
  if (json['result']['status'] == 0) {
    response.statusCode = 400;
    response.end();
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
      response.write(JSON.stringify(match_seq_num)); 
      response.end();
    }, (_) => {
      response.write(JSON.stringify(match_seq_num));
      response.end();
    }
  );
  console.log(count);
};

  
server.listen(12345);


