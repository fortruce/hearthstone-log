var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var keymirror = require('keyMirror');

var EVENTS = require('../constants').TAXONOMIES.ZONE;

var Zone = assign({}, EventEmitter.prototype, {
  EVENTS: EVENTS
});

module.exports = Zone;