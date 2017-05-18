var Medusa = require('./medusa');
var PubNub = require('pubnub');
var Config = require('config');
var argv = require('minimist')(process.argv.slice(2));
var rfcomm = new(require('bluetooth-serial-port')).BluetoothSerialPortServer();
var SerialPort = require('serialport');
var Client = require('node-rest-client').Client;
var delimiter = new Buffer('\r\n');
var channel = argv['c'];
var dataBuffer = new Buffer(0);
var serial_device = '/dev/ttyUSB0';
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
var serial_port = new SerialPort(serial_device,{
  baudrate:9600,
  parser: SerialPort.parsers.readline('\r\n')
});
function sendSync(port, src) {
  return new Promise((resolve, reject) => {
    port.write(src);
    port.once('data', (data) => {
      resolve(data.toString());
    });

    port.once('error', (err) => {
      reject(err);
    });
  });
}
pubnub.addListener({
  message: function(m){
    var msg = m.message;
    if (msg.hasOwnProperty('command')){
      if (msg.command == 'get_and_save'){
        console.log('getting...');
	sendSync(serial_port, 'S\r\n').then((data) => {
	  console.log(data);
	  pubnub.publish({channel: channel, message: {data: data}},
	    function(s,r){}
	  );
          vals = data.split(/\s+/);
	  if (vals.length == 4) {
	    attrib = {quantity: vals[2], quantity_unit: vals[3]};
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
            console.log("vals.length =! 4");
          }
	});
      }
    }
  },
  presence: function(p){
  },
  status: function(s){
  }
});

//          sendSync(serial_port, 'S\r\n').then((data) => {
//	    console.log(data);
//            vals = data.split(/\s+/);
//	    if (vals.length == 4){
//	      var weight = vals[2];
//	      var weight_unit = vals[3];
//	      medusa.save_object(object, {quantity: weight, quantity_unit: weight_unit}, 
//	        function(object){
//	          publishData({'id': id, 'name': object.datum_attributes.name, 'weight': weight, 'weight_unit': weight_unit})
//	        },
//		function(err){
//		});
//	    } else {
//	      publishData({error:'save failed'}) 
 //           }	
  //        });

console.log('Subscribing ' + channel + '...');
pubnub.subscribe({channels:[channel]});
