var Tepra = require('./tepra');
var PubNub = require('pubnub');
var Config = require('config');
var exec = require('child_process').exec;

var tepra = new Tepra(Config.config.tepra);
var pubnub = new PubNub(Config.config.pubnub);
var channel = 'weigh_console';
function publishData(data){
  pubnub.publish(
    {channel: channel, message: data},
    function(status, response){
      console.log(status, response);
    }
  );
}

pubnub.addListener({  
    message: function(m) {
      // handle message
      var msg = m.message; // The Payload
      if (msg == 'restart'){
        console.log('restarting...');
        exec('reboot', function(error, stdout, stderr){
	  if (error != null){
	    console.log(error);
	  }
	});
      } else if (msg.command != undefined){
        if (msg.command == 'print'){
	  tepra.print(msg.id, msg.name);
	}
      }
    },
    presence: function(p) {
        // handle presence
    },
    status: function(s) {
        // handle status
	console.log(s);
	if (s.category === "PNConnectedCategory" || s.category === 'PNReconnectedCategory'){
          pubnub.publish({channel: channel, message: "started"}, function(status, response){
  	  console.log(status, response);
	})
	}
    }
})
console.log('Subscribing...');
pubnub.subscribe({
    channels: [channel]
});
