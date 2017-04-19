var argv = require('minimist')(process.argv.slice(2));
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rfcomm = new(require('bluetooth-serial-port')).BluetoothSerialPortServer();
var delimiter = new Buffer('\r\n');
var port = argv['p'];

if (port == undefined) {
  console.error('Usage: nodejs rfcomm.js -p 2002');
  process.exit(1);
}
app.get('/', function(req, res){
  res.sendFile(__dirname + '/rfcomm.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });
});

rfcomm.listen(
  function(clientAddress){
    var dataBuffer = new Buffer(0);
    console.log('Client: ' + clientAddress + ' connected!');
    rfcomm.on('data',
      function(buffer){
        dataBuffer = Buffer.concat([dataBuffer, buffer]);
	let position;
	while((position = dataBuffer.indexOf(delimiter)) !== -1){
	  var data = dataBuffer.slice(0, position);
	  io.emit('chat message', data.toString());
	  console.log('data: [' + data + ']');
	  dataBuffer = dataBuffer.slice(position + delimiter.length);
	}
      }
    );
  },
  function(error){
    console.log('Something wrong happend!:' + error);
  },
  {}
);

http.listen(port, function(){
  console.log('listening on *:' + port);
});
