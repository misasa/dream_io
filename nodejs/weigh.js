var PubNub = require('pubnub');
var Config = require('config');
var argv = require('minimist')(process.argv.slice(2));
var rfcomm = new(require('bluetooth-serial-port')).BluetoothSerialPortServer();
var SerialPort = require('serialport');
var delimiter = new Buffer('\r\n');
var channel = argv['c'];
var dataBuffer = new Buffer(0);
var serial_device = '/dev/ttyUSB0';
if (channel == undefined) {
  console.error('Usage: nodejs rfcomm.js -c rfcomm');
  process.exit(1);
}

var pubnub = new PubNub(Config.config.pubnub);
function publishData(data){
  pubnub.publish(
    {channel: channel, message: data},
    function(status, response)
    {}
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

rfcomm.on('data',
  function(buffer){
    dataBuffer = Buffer.concat([dataBuffer, buffer]);
    let position;
    while((position = dataBuffer.indexOf(delimiter)) !== -1){
      var data = dataBuffer.slice(0, position);
      console.log('data: [' + data + ']');
      var id = data.toString();
      sendSync(serial_port, 'S\r\n').then((data) => {
        vals = data.split(/\s+/);
	if (vals.length == 4){
	  var weight = vals[2];
	  var weight_unit = vals[3];
	  publishData({'id': id, 'weight': weight, 'weight_unit': weight_unit})
	} else {
	  publishData({'id': id, 'rcv': data}) 
	}
      });
      dataBuffer = dataBuffer.slice(position + delimiter.length);
    }
  }
);
rfcomm.on('closed',function(){ console.log('closed!') });
rfcomm.on('failure', function(err){
  console.log("Something wrong happend!: " + err);
});
rfcomm.listen(
  function(clientAddress){
    var dataBuffer = new Buffer(0);
    console.log('Client: ' + clientAddress + ' connected!');
  },
  function(error){
    console.log('Something wrong happend!:' + error);
  },
  {channel: 1}
);
