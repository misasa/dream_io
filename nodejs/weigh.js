var Medusa = require('./medusa');
var Balance = require('./balance');
var PubNub = require('pubnub');
var Config = require('config');
var argv = require('minimist')(process.argv.slice(2));
var rfcomm = new(require('bluetooth-serial-port')).BluetoothSerialPortServer();
var SerialPort = require('serialport');
var Client = require('node-rest-client').Client;
var delimiter = new Buffer('\r\n');
var channel = argv['c'];
var dataBuffer = new Buffer(0);
var address;
if (channel == undefined) {
  console.error('Usage: nodejs weigh.js -c weigh');
  process.exit(1);
}
var medusa = new Medusa(Config.config.medusa);
var pubnub = new PubNub(Config.config.pubnub);
function publishData(data){
  pubnub.publish(
    {channel: channel, message: data},
    function(status, response)
    {}
  );
}
function publishLog(txt){
  console.log("piblishing log...");
  pubnub.publish(
    {channel: channel, message: {log: txt}},
    function(s,r){
      console.log(s)
    }
  );
}
var balance_conf = Config.config.balance;
balances = {};
if (balance_conf instanceof Array) {
  for (i in balance_conf){
    conf = balance_conf[i];
    balances[conf.port] = new Balance(conf);
  }
} else {
  balances[balance_conf.port] = new Balance(balance_conf);
}

//var balance = new Balance(Config.config.balance);
var port = null;
pubnub.addListener({
  message: function(m){
    var msg = m.message;
    if (msg.hasOwnProperty('command')){
      if (msg.command == 'get_and_save'){
        console.log('getting...');
	console.log(msg);
	if (msg.hasOwnProperty('port')){
	  port = msg.port;
	  console.log("port:" + port);
	} else {
	  port = Object.keys(balances)[0];
	  console.log("port (default):" + port);
	}
	if (port in balances){
	var balance = balances[port];
	balance.gets().then((data) => {
	  console.log(data);
	  pubnub.publish({channel: channel, message: {data: data, name: balance.name, port: balance.port}},
	    function(s,r){}
	  );
	  attrib = balance.parse(data);
	  if (attrib != undefined) {
	    if (msg.hasOwnProperty('object')){
	      object = msg.object;
	      var ary = new Array(object.global_id, object.name, "->", attrib.quantity, attrib.quantity_unit);
	      var log = ary.join(" ");
	      medusa.save_object(msg.object,attrib,
	        function(robj){
		  log += " OK";
		  publishLog(log);
		},
		function(err){
                  log += " ERROR";
		  publishLog(log);
		}
	      );
	    } else {
	      console.log("no object");  
	    }
	  } else {
            console.log("can't get weight");
          }
	});
	};
      }
    }
  },
  presence: function(p){
  },
  status: function(s){
  }
});

console.log('Subscribing ' + channel + '...');
pubnub.subscribe({channels:[channel]});
