var assert = require('assert');

function decodeNoChildren(chunk, key) {
  assert(chunk.children === undefined);
  delete key.taxonomy;
  return key;
}

module.exports = {
  decodeNoChildren
};