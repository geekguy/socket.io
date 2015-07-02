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

app.post('/hb-webhook', function(req, res) {
    console.log(req.body);
   if(connection){
    io.sockets.emit('new message', req.body);
  }
  return res.send("OKAY");
});

app.use(express.static(__dirname + '/public'));
