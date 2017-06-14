var Config = require('config');
var SerialPort = require('serialport');
var Balance = function(config) {
  this.config = config;
  this.name = config.name;
  this.port = config.port;
  this.options = config.options;
  this.options['parser'] = SerialPort.parsers.readline(config.delimiter);
  this.get_command = config.command;
  this.serial_port = new SerialPort(this.port, this.options);
  this.parser = function (data) {
    var myRegexp = /(\+?\-?\d+\.\d+)\s?((kg|g))/;
    match = myRegexp.exec(data);
    console.log('parser:' + match);
    if (match != null){
      return {quantity: match[1], quantity_unit: match[2]}
    }
  }
  this.parse = function(args){
    return this.parser(args);
  }
  this.sendSync = function(src) {
    return new Promise((resolve, reject) => {
      this.serial_port.write(src);
      this.serial_port.once('data', (data) => {
        resolve(data.toString());
      });

      this.serial_port.once('error', (err) => {
        reject(err);
      })
    });
  }
  this.gets = function(){
    return this.sendSync(this.get_command);
  }
  this.say_hello = function(){
    console.log('balance: ' + this.config)
  }
}

module.exports = Balance;
