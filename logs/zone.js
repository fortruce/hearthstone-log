var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var keymirror = require('keyMirror');

var Zone = assign({}, EventEmitter.prototype, {
  EVENTS: keymirror({
    TRANSITIONING: null
  })
});

module.exports = Zone;