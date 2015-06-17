var tokenize = require('./tokenize');
var taxonomize = require('./taxonomize');
var parser = require('./parser');
var assign = require('object-assign');
var assert = require('assert');
var debug = require('debug')('Parse.Power');

function parseTagChange(tokens) {
  assert(tokens.shift() === 'TAG_CHANGE');
  return parser.parseKeyValues(tokens);
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
  var entity = parser.parseKeyValues(tokens);
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
  case 'TAG_CHANGE':
    result = parseTagChange(tokens);
    taxonomy = 'TAG_CHANGE';
    break;
  case 'tag':
    result = parser.parseTagValuePair(tokens);
    taxonomy = 'TAG';
    break;
  case 'GameEntity':
    result = parseEntity(tokens);
    taxonomy = 'GAME_ENTITY';
    break;
  case 'Player':
    result = parseEntity(tokens);
    taxonomy = 'PLAYER_ENTITY';
    break;
  case 'FULL_ENTITY':
    result = parseEntity(tokens);
    taxonomy = 'FULL_ENTITY';
    break;
  case 'CREATE_GAME':
    result = parseCreateGame(tokens);
    taxonomy = 'CREATE_GAME';
    break;
  default:
    debug('no parser found:', chunk.raw);
    return undefined;
  }

  return classify ? taxonomize(result, taxonomy) : result;
};