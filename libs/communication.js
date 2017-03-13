var http = require('http');

var Connection = function(host, port) {
  this.options = {
    host: host,
    port: port,
    path: '/',
    method: 'POST'
  };
};

var Server = function(func) {
  this.server = http.createServer((request, response) => {
    if (request.method == 'POST') {
      var body = '';
      request.on('data', function (data) {
        body += data;
      });
      request.on('end', function () {
        func(body, response);
      });
    } else {
      response.end();
    }
  });
};

Connection.prototype.send = function(data, func, err_func) {
  var str = '';
  var req = http.request(this.options, (res) => {
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      str += chunk;
    });
    res.on('end', () => {
      func(str);
    });
  });

  req.on('error', function(e) {
    console.log(e);
    err_func(e);
  });

  req.write(data);
  req.end();
};

Server.prototype.listen = function(port) {
  this.server.listen(port, () => {
    console.log('Listening on port ' + port);
  });
};

module.exports = {
  Connection: Connection,
  Server: Server
};
