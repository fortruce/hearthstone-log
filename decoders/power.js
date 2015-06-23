var parse = require('../parsers/power');
var utils = require('./utils');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var debug = require('debug')('Decode.Power');
var assert = require('assert');

// constants
var TAXONOMIES = require('../constants').TAXONOMIES.POWER;

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
  };
}

function decodeAction(chunk) {
  var action = parse(chunk);
  var children = [];
  if (chunk.children) {
    children = chunk.children.map(function (c) {
      return parse(c);
    });
  }
  action.actions = children;
  return action;
}

var Power = assign({}, EventEmitter.prototype, {
  EVENTS: TAXONOMIES,
  decode: function(chunk) {
    var key = parse(chunk, true);
    if (!key)
      return;

    var ev;
    switch (key.taxonomy) {
    case TAXONOMIES.TAG_CHANGE:
      ev = utils.decodeNoChildren(chunk, key);
      break;
    case TAXONOMIES.FULL_ENTITY:
      ev = decodeEntity(chunk);
      break;
    case TAXONOMIES.CREATE_GAME:
      ev = decodeCreateGame(chunk);
      break;
    case TAXONOMIES.ACTION:
      ev = decodeAction(chunk);
      break;
    default:
      debug('no decoder found:', key.taxonomy);
      return;
    }

    this.emit(key.taxonomy, ev);
  }
});

module.exports = Power;