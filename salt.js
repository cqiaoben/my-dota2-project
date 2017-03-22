var Comm = require("./libs/communication");
var old_body;
var request = require("request");
var server = new Comm.Server((data, res) => {
  var count = JSON.parse(data); 
  console.log(count);
  var is_get = count % 10;
  var api_url = "http://localhost:8001/apis/extensions/v1beta1/namespaces/default/deployments/salt";
  var test_cond = (!old_body) ? [] : [
   {
     "op": "test", "path": "/metadata/annotations/federation.kubernetes.io~1deployment-preferences", "value": old_body
   }
  ];
  var request_body = JSON.stringify(test_cond.concat([
   {
     "op": "replace", "path": "/metadata/annotations/federation.kubernetes.io~1deployment-preferences", "value": "{\n    \"rebalance\": true,\n    \"clusters\": {\n        \"cluster-us-east1-b\": {\n            \"minReplicas\": 1,\n            \"maxReplicas\": 1,\n            \"weight\": 1\n        },\n        \"cluster-europe-west1-b\": {\n            \"minReplicas\": 2,\n            \"maxReplicas\": 2,\n            \"weight\": 1\n        }\n    }\n}"
   }
  ]));
  request({
    headers: {'Content-Type': 'application/json-patch+json'},
    url: api_url,
    method: is_get ? 'GET' : 'PATCH',
    body: request_body
  }, function(e, r, b) {
    if (e) {
      console.log('fail');
      res.end();
      return;
    }
    try {
      date = r.headers.date;
      //console.log(b);
      var annotation = JSON.parse(b).metadata.annotations['federation.kubernetes.io/deployment-preferences'];
      //console.log(annotation);
      var clusters = Object.keys(JSON.parse(annotation).clusters);
      console.log(clusters);
      old_body = annotation;
    } catch (e) {
      console.log(e);
    }
    res.end();
  });

});
server.listen(15151);

var count = 1;
var send_func = function() {
  var salt_connection = new Comm.Connection(
    'salt.default.federation.svc.cqiaoben.com', 8002);
  salt_connection.send(JSON.stringify(count), (_) => {count = count + 1;}, ()=>{});
  setTimeout(send_func, 5000);
};
send_func();
