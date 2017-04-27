var exec = require('child_process').exec;
var app = require('express')();
var http = require('http').Server(app);
var port = 80;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/weigh.html');
});

app.post('/reset', function(req, res){
  console.log('restarting...');
  res.send('restarting...');
  exec('reboot', function(error, stdout, stderr){
    if (error != null){
      console.log(error);
    }
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
