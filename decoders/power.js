var powerLog = require('../logs/power');
var parse = require('../parsers/power');
var utils = require('./utils');

var debug = require('debug')('Decode.Power');
var assert = require('assert');

function decodeTags(chunk) {
  return chunk.children.map(function (c) {
    return parse(c);
  }).reduce(function (col, tag) {
    col[tag.tag] = tag.value;
    return col;
  }, {});
}

function decodeEntity(chunk) {
  var entity = parse(chunk);
  var tags = decodeTags(chunk);
  entity.tags = tags;
  return entity;
}

function decodeCreateGame(chunk) {
  assert(chunk.children.length === 3);
  var game = decodeEntity(chunk.children[0]);
  var player1 = decodeEntity(chunk.children[1]);
  var player2 = decodeEntity(chunk.children[2]);
  return {
    game: game,
    players: [player1, player2]
  }
}

module.exports = function decode (chunk) {
  var key = parse(chunk, true);
  if (!key)
    return;

  var ev;
  switch (key.taxonomy) {
  case 'TAG_CHANGE':
    ev = utils.decodeNoChildren(chunk, key);
    break;
  case 'FULL_ENTITY':
    ev = decodeEntity(chunk);
    break;
  case 'CREATE_GAME':
    ev = decodeCreateGame(chunk);
    break;
  default:
    debug('no decoder found:', key.taxonomy);
    return;
  }

  // TODO: fire event to the powerLog
  debug('decoded:', ev);
};