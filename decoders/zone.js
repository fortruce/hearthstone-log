var zoneLog = require('../logs/zone');
var parse = require('../parsers/zone');

var debug = require('debug')('Decode.Zone');
var assert = require('assert');

function decodeTransition(chunk) {
  assert(chunk.children == undefined);
  return parse(chunk);
}

module.exports = function decode(chunk) {
  var key = parse(chunk, true);
  if (!key)
    return;

  var ev;
  switch (key.taxonomy) {
  case 'TRANSITIONING':
    ev = decodeTransition(chunk);
    break;
  default:
    debug('no decoder found:', key.taxonomy);
    return;
  }

  // TODO: fire event to the zoneLog
  debug('decoded:', ev);
}