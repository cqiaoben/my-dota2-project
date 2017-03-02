var http = require('http');
var server = http.createServer(function(request, response) {
  console.log('get a request!');
  response.end();
});
server.listen(12345, function() {
  console.log('i am listening');
});
