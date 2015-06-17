var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var keymirror = require('keyMirror');

var Power = assign({}, EventEmitter.prototype, {
  EVENTS: keymirror({
    FULL_ENTITY: null,
    TAG_CHANGE: null,
    CREATE_GAME: null
  })
});

module.exports = Power;