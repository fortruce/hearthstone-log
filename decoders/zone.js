var parse = require('../parsers/zone');
var utils = require('./utils');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var debug = require('debug')('Decode.Zone');
var assert = require('assert');

// constants
var TAXONOMIES = require('../constants').TAXONOMIES.ZONE;

function decodeTransition(chunk) {
  assert(chunk.children === undefined);
  return parse(chunk);
}

var Zone = assign({}, EventEmitter.prototype, {
  EVENTS: TAXONOMIES,
  decode: function(chunk) {
    var key = parse(chunk, true);
    if (!key)
      return;

    var ev;
    switch (key.taxonomy) {
    case TAXONOMIES.TRANSITIONING:
      ev = decodeTransition(chunk);
      break;
    case TAXONOMIES.ZONE_CHANGE:
      ev = utils.decodeNoChildren(chunk, key);
      break;
    default:
      debug('no decoder found:', key.taxonomy);
      return;
    }

    this.emit(key.taxonomy, ev);
  }
});

module.exports = Zone;