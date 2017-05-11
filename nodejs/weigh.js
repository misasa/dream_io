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
var client = new Client(Config.config.medusa.auth);
function get_object(id, onsuccess, onerror) {
  var record_url = Config.config.medusa.url + 'records/' + id + '.json';
  console.log("record_url: " + record_url);
  client.get(record_url, function(data, response){
    if (response.statusCode == '200'){
      onsuccess(data);
    } else {
      onerror(response.statusMessage);
    }
  }).on('error', function (err){
    onerror(err);
  });
}
function resource_url(object){
  var url = Config.config.medusa.url;
  switch (object.datum_type){
    case 'Specimen':
      url += 'specimens/';
      break;
    case 'Box':
      url += 'boxes/';
      break;
    case 'AttachmentFile':
      url += 'attachment_files/';
      break;
    case 'Bib':
      url += 'bibs/';
      break;
  }
  url += object.datum_attributes.id + '.json';
  return url
}
function to_args(object, param){
  switch (object.datum_type){
    case 'Specimen':
      args = {parameters: {specimen: param}}
      break;
    case 'Box':
      args = {parameters: {box: param}}
      break;
    case 'AttachmentFile':
      args = {parameters: {attachment_file: param}}
      break;
    case 'Bib':
      args = {parameters: {bib: param}}
      break;
  }
  return args
}
function save_object(object, param, onsuccess, onerror) {
  var object_url = resource_url(object);
  var args = to_args(object, param);
  client.put(object_url, args, function (data, response){
    if (response.statusCode == 204){
      onsuccess(object)
    } else {
      onerror(response.statusCode)
    }
  });
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

function to_id(string){
  var id = string;
  vals = string.split(/=/);
  if (vals.length == 2){
    id = vals[1];
  }
  return id;
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
        {channel: 'rfcomm', message: {address: address, data: data.toString()}},
	function(status, response){}
      );
      var id = to_id(data.toString());
      get_object(id, 
        function (object){
          sendSync(serial_port, 'S\r\n').then((data) => {
            vals = data.split(/\s+/);
	    if (vals.length == 4){
	      var weight = vals[2];
	      var weight_unit = vals[3];
	      save_object(object, {quantity: weight, quantity_unit: weight_unit}, 
	        function(object){
	          publishData({'id': id, 'name': object.datum_attributes.name, 'weight': weight, 'weight_unit': weight_unit})
	        },
		function(err){
		});
	    } else {
	      //publishData({'id': id, 'rcv': data}) 
            }	
          });
	},
	function (err){}
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
      {channel: 'rfcomm', message: {'address' : clientAddress}},
      function(status,response){}
    );
  },
  function(error){
    console.log('Something wrong happend!:' + error);
  },
  {channel: 1}
);
