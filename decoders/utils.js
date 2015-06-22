var assert = require('assert');
var debug = require('debug')('Decode.Utils');
var deepcopy = require('deepcopy');

function decodeNoChildren(chunk, key) {
  assert(chunk.children === undefined);
  var o = deepcopy(key);
  delete o.taxonomy;
  return o;
}

module.exports = {
  decodeNoChildren
};