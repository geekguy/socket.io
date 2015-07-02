// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 8080;

// app.use(express.bodyParser());
app.use(express.logger());
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(express.bodyParser());

app.post('/', function(req, res) {
    console.log('hi');
    console.log(req.body);
    return res.send("OKAY");
});

app.post('/hb-webhook', function(req, res) {
    console.log('hi 2');
    console.log(req.body);
    io.sockets.emit('new_notification', req.body);
    return res.send("OKAY");
});

app.get('/pingdom-webhook', function(req, res) {
    console.log(req.body);
    io.sockets.emit('new_notification', req.body);
    return res.send("OKAY");
});

app.use(express.static(__dirname + '/public'));
