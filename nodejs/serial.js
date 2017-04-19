var argv = require('minimist')(process.argv.slice(2));
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var SerialPort = require('serialport');
var port = argv['p'];
var device = argv['d'];
if (port == undefined || device == undefined){
  console.error('Usage: nodejs ttyUSB0.js -p 2001 -d /dev/ttyUSB0');
  process.exit(1);
}

var serial = new SerialPort(device,{
    baudrate:9600,
    parser: SerialPort.parsers.readline('\r\n')
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/serial.html');
});

serial.on('data', function(data){
  console.log('data: [' + data.toString() + ']');
  io.emit('chat message',data.toString());
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log('message: ' + msg);
    serial.write(msg + '\r\n');
  });
}); 

http.listen(port, function(){
  console.log('listening on *:' + port);
});
