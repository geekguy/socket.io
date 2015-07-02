// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 8080;

// app.use(express.bodyParser());

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(express.bodyParser());

function broadcast_message(message){
  console.log(req.body);
  io.sockets.emit('new_notification', req.body);
  return res.send("OKAY");
}
app.post('/hb-webhook', function(req, res) {
    broadcast_message(message);
});

app.post('/pingdom-webhook', function(req, res) {
    broadcast_message(message);
});

app.use(express.static(__dirname + '/public'));
