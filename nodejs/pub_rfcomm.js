var PubNub = require('pubnub');
var Config = require('config');
var argv = require('minimist')(process.argv.slice(2));
var rfcomm = new(require('bluetooth-serial-port')).BluetoothSerialPortServer();
var delimiter = new Buffer('\r\n');
var channel = argv['c'];
var dataBuffer = new Buffer(0);
var address;
var pubnub = new PubNub(Config.config.pubnub);

if (channel == undefined) {
  console.error('Usage: nodejs pub_rfcomm.js -c rfcomm');
  process.exit(1);
}
rfcomm.on('data',
  function(buffer){
    dataBuffer = Buffer.concat([dataBuffer, buffer]);
    let position;
    while((position = dataBuffer.indexOf(delimiter)) !== -1){
      var data = dataBuffer.slice(0, position);
      dataBuffer = dataBuffer.slice(position + delimiter.length);
      console.log('data: [' + data + ']');
      pubnub.publish(
        {channel: channel, message: {'address' : address, 'data' : data.toString()}},
	function(status, response){}
      );
    }
  }
);
rfcomm.on('closed',function(){ console.log('closed!') });
rfcomm.on('failure', function(err){
  console.log("Something wrong happend!: " + err);
});
rfcomm.listen(
  function(clientAddress){
    address = clientAddress;
    var dataBuffer = new Buffer(0);
    console.log('Client: ' + clientAddress + ' connected!');
    pubnub.publish(
      {channel: channel, message: {'address' : clientAddress}},
      function(status, response){}
    );
  },
  function(error){
    console.log('Something wrong happend!:' + error);
  },
  {channel: 1}
);
console.log("listening rfcomm...");
