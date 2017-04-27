var argv = require('minimist')(process.argv.slice(2));
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rfcomm = new(require('bluetooth-serial-port')).BluetoothSerialPortServer();
var delimiter = new Buffer('\r\n');
var port = argv['p'];
var dataBuffer = new Buffer(0);

if (port == undefined) {
  console.error('Usage: nodejs rfcomm.js -p 2002');
  process.exit(1);
}
app.get('/', function(req, res){
  res.sendFile(__dirname + '/rfcomm.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  console.log('rfcomm: ' + rfcomm.isOpen());
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });
});

rfcomm.on('data',
  function(buffer){
    dataBuffer = Buffer.concat([dataBuffer, buffer]);
    let position;
    while((position = dataBuffer.indexOf(delimiter)) !== -1){
      var data = dataBuffer.slice(0, position);
      io.emit('chat message', data.toString());
      console.log('data: [' + data + ']');
      dataBuffer = dataBuffer.slice(position + delimiter.length);
      rfcomm.close();
      return;
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

http.listen(port, function(){
  console.log('listening on *:' + port);
});
