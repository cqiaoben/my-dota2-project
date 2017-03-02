var http = require('http');
http.get('http://' + process.argv[2], function(response) {
  response.on('data', function() {}); 
  response.on("end", function() {
    console.log('got a reponse!');
  });
});
