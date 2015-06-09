///
/// @copyright 2015 Adam Meily <meily.adam@gmail.com>
///


var http = require('http');
var util = require('util');
var MrIssueDriver = require('./driver');
var config = require('./config');
var logger = require('./logger');



var driver = new MrIssueDriver(config, function(err) {
  if(err) {
    logger.error("failed to initialize mr-issue: %s", err.message);
    return;
  }

  http.createServer(function(req, res) {
    // req.url == "/endpoint"

    var data = "";
    req.on('data', function(chunk) {
      data += chunk;
    });

    req.on('end', function() {
      var body;

      try {
        body = JSON.parse(data);
      } catch(e) {
        body = null;
      }

      if(body) {
        logger.info(
          "received webhook request: %s [action: %s]", req.url,
          body.object_attributes.action
        );

        driver.handleWebHook(req.url, body);
      } else {
        logger.warn("received invalid JSON request: " + req.url);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok": true}');
    });
  }).listen(8080, "0.0.0.0");
});
