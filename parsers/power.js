var tokenize = require('./tokenize');
var taxonomize = require('./taxonomize');
var utils = require('./utils');
var assign = require('object-assign');
var assert = require('assert');
var debug = require('debug')('Parse.Power');

// constants
var TAXONOMIES = require('../constants').TAXONOMIES.POWER;
var KEYWORDS = require('../constants').KEYWORDS.POWER;

function parseTagChange(tokens) {
  assert(tokens.shift() === 'TAG_CHANGE');
  return utils.parseKeyValues(tokens);
}

function parseEntity(tokens) {
  var entityType = tokens.shift();
  assert(['GameEntity', 'Player', 'FULL_ENTITY'].indexOf(entityType) !== -1);
  if (entityType === 'FULL_ENTITY') {
    // consume extra tokens in FULL_ENTITY denoted by ()
    // FULL_ENTITY (- Creating) ID=5 CardID=CS2_101
    assert(tokens.shift() === '-');
    assert(tokens.shift() === 'Creating');
  }
  var entity = utils.parseKeyValues(tokens);
  entity.entity = entityType;
  return entity;
}

function parseCreateGame(tokens) {
  assert(tokens.shift() === 'CREATE_GAME');
  return {};
}

module.exports = function parse(chunk, classify) {
  var tokens = tokenize(chunk.raw);

  var taxonomy;
  var result;

  switch(tokens[0]) {

  case KEYWORDS.TAG_CHANGE:
    result = parseTagChange(tokens);
    taxonomy = TAXONOMIES.TAG_CHANGE;
    break;

  case KEYWORDS.TAG:
    result = utils.parseTagValuePair(tokens);
    taxonomy = TAXONOMIES.TAG;
    break;

  case KEYWORDS.GAME_ENTITY:
    result = parseEntity(tokens);
    taxonomy = TAXONOMIES.GAME_ENTITY;
    break;

  case KEYWORDS.PLAYER:
    result = parseEntity(tokens);
    taxonomy = TAXONOMIES.PLAYER_ENTITY;
    break;

  case KEYWORDS.FULL_ENTITY:
    result = parseEntity(tokens);
    taxonomy = TAXONOMIES.FULL_ENTITY;
    break;

  case KEYWORDS.CREATE_GAME:
    result = parseCreateGame(tokens);
    taxonomy = TAXONOMIES.CREATE_GAME;
    break;

  default:
    debug('no parser found:', chunk.raw);
    return undefined;
  }

  return classify ? taxonomize(result, taxonomy) : result;
};