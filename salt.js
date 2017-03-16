var Comm = require("./libs/communication");
var request = require("request");
var server = new Comm.Server((data, res) => {

  console.log('getting request!');
  var api_url = "http://localhost:8001/apis/extensions/v1beta1/namespaces/default/replicasets/salt";
  var request_body = JSON.stringify(
  [
   {
     "op": "replace", "path": "/metadata/annotations/federation.kubernetes.io~1replica-set-preferences", "value": "{\n    \"rebalance\": true,\n    \"clusters\": {\n        \"gce-us-east1\": {\n            \"minReplicas\": 1,\n            \"maxReplicas\": 1,\n            \"weight\": 1\n        },\n        \"gce-us-central1\": {\n            \"minReplicas\": 2,\n            \"maxReplicas\": 2,\n            \"weight\": 1\n        }\n    }\n}"
   }
  ]
  );
  request({
    headers: {'Content-Type': 'application/json-patch+json'},
    url: api_url,
    method: 'PATCH',
    body: request_body
  }, function(e, r, b) {
    if (e) console.log(e);
    console.log(r, b);
    res.end();
  });

});
server.listen(15151);

var salt_connection = new Comm.Connection("localhost", 8001);
var send_func = function() {
  salt_connection.send(JSON.stringify(1), (_) => {}, ()=>{});
  setTimeout(send_func, 5000);
};
send_func();

