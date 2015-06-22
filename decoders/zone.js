var zoneLog = require('../logs/zone');
var parse = require('../parsers/zone');
var utils = require('./utils');

var debug = require('debug')('Decode.Zone');
var assert = require('assert');

// constants
var TAXONOMIES = require('../constants').TAXONOMIES.ZONE;

function decodeTransition(chunk) {
  assert(chunk.children === undefined);
  return parse(chunk);
}

module.exports = function decode(chunk) {
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

  zoneLog.emit(key.taxonomy, ev);
};