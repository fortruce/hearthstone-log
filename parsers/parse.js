var Writable = require('stream').Writable;
var util = require('util');
var debug = require('debug')('Parse');

var { LOGS, EVENTS } = require('../constants');

// handlers
var power = require('./power');
var zone = require('./zone');

function getHandler(log) {
  switch (log.toUpperCase()) {
    case LOGS.POWER:
      return power;
    case LOGS.ZONE:
      return zone;
    default:
      debug('Could not find a handler for:', log.toUpperCase());
      return undefined;
  }
}

function Parse() {
  if (!(this instanceof Parse))
    return new Parse();

  Writable.call(this, {objectMode: true});
}
util.inherits(Parse, Writable);

Parse.prototype._decode = function(tree) {
  var handler = getHandler(tree.log);
  if (!handler)
    return;
  var res = handler.decode(tree);
  if (!res)
    return;
  var [event, payload] = res;
  this.emit(event, payload);
}

Parse.prototype._write = function (chunk, enc, next) {
  this._decode(chunk);
  next();
}

module.exports = Parse;