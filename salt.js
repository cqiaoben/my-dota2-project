var Comm = require("./libs/communication");
var request = require("request");
var server = new Comm.Server((data, res) => {
  console.log('getting request!');
  var api_url = "http://localhost:8001/apis/extensions/v1beta1/namespaces/default/deployments/salt";
  var request_body = JSON.stringify(
  [
   {
     "op": "replace", "path": "/metadata/annotations/federation.kubernetes.io~1deployment-preferences", "value": "{\n    \"rebalance\": true,\n    \"clusters\": {\n        \"cluster-us-east1-b\": {\n            \"minReplicas\": 1,\n            \"maxReplicas\": 1,\n            \"weight\": 1\n        },\n        \"cluster-europe-west1-b\": {\n            \"minReplicas\": 2,\n            \"maxReplicas\": 2,\n            \"weight\": 1\n        }\n    }\n}"
   }
  ]
  );
  request({
    headers: {'Content-Type': 'application/json-patch+json'},
    url: api_url,
    method: 'GET',
  }, function(e, r, b) {
    if (e) {
      console.log('fail');
      res.end();
      return;
    }
    try {
      console.log(b);
      var annotation = JSON.parse(b).metadata.annotations['federation.kubernetes.io/deployment-preferences'];
      console.log(annotation);
      var clusters = Object.keys(JSON.parse(annotation).clusters);
      console.log(clusters);
    } catch (e) {
      console.log(e);
    }
    res.end();
  });

});
server.listen(15151);

var send_func = function() {
  var salt_connection = new Comm.Connection(
    'salt.default.federation.svc.cqiaoben.com', 8002);
  salt_connection.send(JSON.stringify(1), (_) => {}, ()=>{});
  setTimeout(send_func, 5000);
};
send_func();
