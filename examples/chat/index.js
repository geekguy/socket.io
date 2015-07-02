// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 8080;
var hbEventList = ['occurred', 'assigned']
var mp3Hash = {
	1: 'pay-attention'
}

// some code to make sure we can read aws json :/.
// app.use(function(req, res, next) {
//   req.rawBody = '';
//   req.setEncoding('utf8');

//   req.on('data', function(chunk) {
//     req.rawBody += chunk;
//   });

//   req.on('end', function() {
//     next();
//   });
// });
app.use(express.bodyParser());

app.use(express.logger());


server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(express.bodyParser());


app.post('/hb-webhook', function(req, res) {
	console.log(req.body);
	if(hbEventList.indexOf(req.body.event) != -1) {
	  var data = {
	  	message: req.body.message,
	  	mp3_slug: mp3Hash[1]
	  }
	  io.sockets.emit('new_notification', data);
	}
    return res.send("OKAY");
});

app.get('/pingdom-webhook', function(req, res) {
  io.sockets.emit('new_notification', req.body);
  return res.send("OKAY");
});

app.post('/aws-webhook', function(req, res) {
  io.sockets.emit('new_notification', req.body);
  return res.send("OKAY");
});

app.use(express.static(__dirname + '/public'));
