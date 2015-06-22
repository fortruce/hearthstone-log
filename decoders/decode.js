var util = require('util');
var Writable = require('stream').Writable;

// decoders
var power = require('./power');
var zone = require('./zone');

// constants
var LOGS = require('../constants').LOGS;

function Decode() {
  if (!(this instanceof Decode))
    return new Decode();

  Writable.call(this, {objectMode: true});
}
util.inherits(Decode, Writable);

Decode.prototype._write = function(chunk, enc, next) {
  switch(chunk.log.toUpperCase()) {
  case LOGS.POWER:
    power(chunk);
    break;
  case LOGS.ZONE:
    zone(chunk);
    break;
  default:
    debug('no decoder found:', chunk.log);
    break;
  }

  next();
};

module.exports = Decode;