var Config = require('config');
var Client = require('node-rest-client').Client;
var Medusa = function(config) {
  this.config = config;
  this.base_url = config.url;
  this.auth = config.auth;
  this.client = new Client(config.auth);
  this.to_id = function(string) {
    var id = string;
    vals = string.split(/=/);
    if (vals.length == 2){
      id = vals[1];
    }
    return id;
  }
  this.record_url = function(id){
    id = this.to_id(id);
    return this.base_url + 'records/' + id + '.json';
  }
  this.resource_url = function(object){
    var url = this.base_url;
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
  this.to_args = function(object, param){
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
  this.get_object = function(id, onsuccess, onerror) {
    var record_url = this.record_url(id);
    console.log('medusa:' + record_url + ' getting...')
    this.client.get(record_url, 
      function(data, response){
        if (response.statusCode == '200'){
          console.log('medusa: ' + data)
	  onsuccess(data);
	} else {
	  onerror(response.statusMessage);
	}
      }
    ).on('error', function(err){
      onerror(err);
    });
  }
  this.save_object = function(object, param, onsuccess, onerror){
    var object_url = this.resource_url(object);
    var args = this.to_args(object, param);
    console.log('medusa: ' + object_url + param + ' saving...')
    this.client.put(object_url, args, function (data, response){
      if (response.statusCode == 204){
        console.log('OK')
	onsuccess(object)
      } else {
	onerror(response.statusCode)
      }
    });
  }
}

module.exports = Medusa;
