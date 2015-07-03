// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 8080;
var redis = require("redis");
var redisClient = redis.createClient();
var hbEventList = ['occurred', 'assigned', 'resolved']
var mp3Hash = {
	1: 'slimshady',
	2: 'siren'
}

var aws_arn_mapping = {
  'arn:aws:sns:us-west-2:283994472123:HRWebHook': "WebHook Server CPU is High. Please check."
}

// some code to make sure we can read aws json :/.
app.use(function(req, res, next) {
  var contentType = req.headers['content-type'] || ''
    , mime = contentType.split(';')[0];

  if (mime != 'text/plain') {
    return next();
  }

  var data = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) {
    data += chunk;
  });
  req.on('end', function() {
    req.rawBody = data;
    next();
  });
});

function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
function getAssigneeName(str){
  console.log("insite getAssigneeName")
  console.log(str.split("@hackerrank.com")[0])
  return str.split("@hackerrank.com")[0]
}
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
    if(req.body.event == 'resolved'){
      data['message'] = "hb error resolved"
      data['mp3_slug'] = ''
      if(req.body.actor && req.body.actor.name){
        data['assignee'] = req.body.actor.name;
      }
      else if(req.body.actor && req.body.actor.email){
        data['assignee'] = req.body.getAssigneeName(req.body.actor.email);
      }
    }
    console.log(data)
	  io.sockets.emit('new_notification', data);
	}
    return res.send("OKAY");
});

app.get('/pingdom-webhook', function(req, res) {
  var data = {
	message: req.get('description'),
	mp3_slug: mp3Hash[2]
  }
  io.sockets.emit('new_notification', data);
  return res.send("OKAY");
});

app.post('/aws-webhook', function(req, res) {
  // console.log(req)
  console.log(req.rawBody);
  console.log(JSON.parse(req.rawBody));
  if(IsJsonString(req.rawBody)) {
    console.log('its json')
    jsonBody = JSON.parse(req.rawBody)
    if (jsonBody.TopicArn){
      message = aws_arn_mapping[jsonBody.TopicArn]
      if (!message){
        message = 'Something is wrong on AWS. Please Check SNS.'
      }
      io.sockets.emit('new_notification', {message: message, mp3_slug: ''});
      return res.send("OKAY");
    }
  }
  return res.send("NOT OKAY");
});

app.post('/git-webhook', function(req, res){
	if ((res.req.body.action=="opened" || res.req.body.action=="labeled" || res.req.body.action=="assigned" ) && res.req.body.issue.assignee!=null){
		for (var i=0; i < res.req.body.issue.labels.length; i++){
			if(res.req.body.issue.labels[i].name == "P0" || res.req.body.issue.labels[i].name == "Critical"){
				var msg = "New issue Assigned to " + res.req.body.issue.assignee.login + ", of " + res.req.body.issue.labels[i].name + " label";
				var data = {
	  				message: msg,
	  				mp3_slug: ''
	  			}
				io.sockets.emit('new_notification', data);
				break;
			}
		}
	}
	return res.send("Okay");
});

app.get('/hb-leaderboard', function(req, res) {
	redisClient.zrange('user-faults', 0, -1, 'withscores', function(err, reply){
	  if(reply.length == 0) return;
	  io.sockets.emit('hb_leaderboard', {result: reply});
	});
	return res.send("OKAY");
});

setInterval(function(){
  redisClient.zrange('user-faults', 0, -1, 'withscores', function(err, reply){
    if(reply.length == 0) return
    io.sockets.emit('hb_leaderboard', {result: reply});
  });
}, 1800000);

app.use(express.static(__dirname + '/public'));
