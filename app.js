
var http = require('http');
var util = require('util');
var MrIssueDriver = require('./driver');
var MrIssueConfig = require('./config');

var config = new MrIssueConfig();
var driver = new MrIssueDriver(config, function(err) {
  if(err) {
    console.log("Could not initialize Mr. Issue driver: " + err);
    return;
  }

  http.createServer(function(req, res) {
      // req.url == "/endpoint"

      var data = "";
      req.on('data', function(chunk) {
          data += chunk;
      });

      req.on('end', function() {
          var body = null;
          try {
              body = JSON.parse(data);
          } catch(e) {
          }

          if(body) {

          }

          console.log(req.url);
          console.log(util.inspect(body, false, null, true));
          console.log("\n");

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('{"ok": true}');

          driver.handleWebHook(req.url, body);
      });
  }).listen(8080, "0.0.0.0");
});
