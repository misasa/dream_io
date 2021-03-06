var Client = require('node-rest-client').Client;
var Tepra = function(config) {
  this.config = config;
  this.base_url = config.url;
  this.printer = config.printer;
  this.template = config.template;
  this.client = new Client();
  this.print = function(id, name){
    var url = this.base_url;
    url += 'Format/Print';
    var param = {'UID': id, 'NAME': name};
    param['printer'] = config.printer;
    param['template'] = config.template;
    this.client.get(url, {parameters: param}, function (data, response){
      if (response.statusCode != '200'){
        console.log('NG');
      }
    }).on('error', function(err){console.log('tepra print error!')});
  }
}

module.exports = Tepra;
