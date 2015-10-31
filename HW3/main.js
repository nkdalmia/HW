var redis = require('redis')
var multer = require('multer')
var express = require('express')
var fs = require('fs')
var app = express()
var httpProxy = require('http-proxy')

// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})
var key = "test1";
var recentKey = "recent";
var imagesKey = "images";
var targetNodesKey = "targets";

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) {
    console.log(req.method, req.url);

    client.lpush(recentKey, req.method + req.url);
    client.ltrim(recentKey, 0, 4);

    next(); // Passing the request to the next handler in the stack.
});

app.post('/upload', [multer({dest: './uploads/'}), 
    function(req, res) {
        console.log(req.body) // form fields
        console.log(req.files) // form files

        if (req.files.image) {
            fs.readFile(req.files.image.path, function(err, data) {
                if (err) throw err;
                var img = new Buffer(data).toString('base64');
                client.lpush(imagesKey, img);
            });
        }

        res.status(204).end()
    }
]);

app.get('/meow', function(req, res) {
    client.lpop(imagesKey, function(err, imagedata) {
        if (err) throw err;
        if (!imagedata) {
            res.status(500).send('No Image available in list!');
        } else {
            res.writeHead(200, {'content-type':'text/html'});
            res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");
            res.end();
        }
    });
})

app.get('/get', function(req, res) {
    client.get(key, function(err, value) {
        res.send(value == undefined ? "Value not found" : value)
    });
});

app.get('/set', function(req, res) {
    client.set(key, "this message will self-destruct in 10 seconds.");
    client.expire(key, 10);
    res.send("Value set");
});

app.get('/recent', function(req, res) {
    client.lrange(recentKey, 0, 4, function(err, value) {
        res.send(value)
    });
});

// Server Info (ip, port, number of servers)
var targetNodes = [];
var ports = [3000, 3001];
ports.forEach(function(port) {
    var server = app.listen(port);
    var host = server.address().address;
    if (!host || host == "::") {
        host = "127.0.0.1";
    }
    var targetNode = "http" + "://" + host + ":" + server.address().port;
    console.log('App listening at %s', targetNode);
    targetNodes.push(targetNode);
});

//Add server list to redis
client.del(targetNodesKey);
targetNodes.forEach(function(s) {
    client.lpush(targetNodesKey, s);
});

//Proxy related code
var proxy = httpProxy.createProxyServer({});
var proxyApp = express()
proxyApp.all('/*', function(req, res) {
    client.rpoplpush(targetNodesKey, targetNodesKey, function(err, value) {
        console.log("proxying to %s", value);
        proxy.web(req, res, {target: value});
    });
});

var proxyServer = proxyApp.listen(5000, function() {

    var host = proxyServer.address().address
    var port = proxyServer.address().port

    console.log('Proxy server listening at http://%s:%s', host, port)
});
