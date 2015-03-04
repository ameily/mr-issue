
var http = require('http');
var util = require('util');

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
    });
}).listen(8080, "0.0.0.0");

