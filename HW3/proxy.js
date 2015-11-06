var redis = require('redis')
var express = require('express')
var app = express()
var httpProxy = require('http-proxy')

var proxyPort = 8080;    // default port
var targetNodes = [];
process.argv.forEach(function (val, index, array) {
    if (index > 1) {
        if (index == 2) {
            proxyPort = parseInt(val);
        } else {
            targetNodes.push(val);
        }
    }
});

var client = redis.createClient(6379, 'localhost', {})

//Add target nodes to redis
var targetNodesKey = "targets";
client.del(targetNodesKey);     //first cleanup old data
targetNodes.forEach(function(s) {
    client.lpush(targetNodesKey, s);
});

var proxy = httpProxy.createProxyServer({});
var proxyApp = express();
proxyApp.all('/*', function(req, res) {
    client.rpoplpush(targetNodesKey, targetNodesKey, function(err, value) {
        console.log("proxying request to %s", value);
        proxy.web(req, res, {target: value});
    });
});

var proxyServer = proxyApp.listen(proxyPort, function() {
    var host = proxyServer.address().address
    if (!host || host == "::") {
        host = "localhost";
    }
    var port = proxyServer.address().port
    console.log('Proxy server listening at http://%s:%s', host, port)
});
