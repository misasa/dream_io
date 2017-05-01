var PubNub = require('pubnub');
var Config = require('config');
var exec = require('child_process').exec;
//var app = require('express')();
//var http = require('http').Server(app);
//var port = 80;

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/weigh.html');
// });

// app.post('/reset', function(req, res){
//   console.log('restarting...');
//   res.send('restarting...');
//   exec('reboot', function(error, stdout, stderr){
//     if (error != null){
//       console.log(error);
//     }
//   });
// });

// http.listen(port, function(){
//   console.log('listening on *:' + port);
// });

var pubnub = new PubNub(Config.config.pubnub);
var channel = 'weigh_console';
function publishData(data){
  pubnub.publish(
    {channel: channel, message: data},
    function(status, response)
    {}
  );
}

pubnub.addListener({  
    message: function(m) {
        // handle message
        var channelName = m.channel; // The channel for which the message belongs
        var channelGroup = m.subscription; // The channel group or wildcard subscription match (if exists)
        var pubTT = m.timetoken; // Publish timetoken
        var msg = m.message; // The Payload
        if (msg == 'restart'){
          console.log('restarting...');
		  exec('reboot', function(error, stdout, stderr){
		    if (error != null){
			  console.log(error);
			}
		  });
        }
    },
    presence: function(p) {
        // handle presence
        var action = p.action; // Can be join, leave, state-change or timeout
        var channelName = p.channel; // The channel for which the message belongs
        var occupancy = p.occupancy; // No. of users connected with the channel
        var state = p.state; // User State
        var channelGroup = p.subscription; //  The channel group or wildcard subscription match (if exists)
        var publishTime = p.timestamp; // Publish timetoken
        var timetoken = p.timetoken;  // Current timetoken
        var uuid = p.uuid; // UUIDs of users who are connected with the channel
    },
    status: function(s) {
        // handle status
    }
})

pubnub.subscribe({
    channels: [channel],
    withPresence: true // also subscribe to presence instances.
})
pubnub.publish({channel: channel, message: {status: true}}, function(status, response){});