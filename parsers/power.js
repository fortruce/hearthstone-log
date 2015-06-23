var utils = require('./utils');
var tokenize = require('./tokenize');
var assert = require('assert');
var debug = require('debug')('Handler.Power');

var constants = require('../constants');
var KEYWORDS = constants.KEYWORDS.POWER;
var TAXONOMIES = constants.TAXONOMIES.POWER;
var EVENTS = constants.EVENTS;

/*
          PARSER FUNCTIONS
 */

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

function parseAction(tokens) {
  assert(tokens.shift() === 'ACTION_START');
  return utils.parseKeyValues(tokens);
}

/*
          DECODER FUNCTIONS
 */

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

/*
          HANDLER FUNCTIONS
 */

function parse(chunk) {
  var tokens = tokenize(chunk.raw);
  switch(tokens[0]) {
    case KEYWORDS.TAG_CHANGE:
      return utils.classify(parseTagChange(tokens), TAXONOMIES.TAG_CHANGE);

    case KEYWORDS.TAG:
      return utils.classify(utils.parseTagValuePair(tokens), TAXONOMIES.TAG);

    case KEYWORDS.GAME_ENTITY:
      return utils.classify(parseEntity(tokens), TAXONOMIES.GAME_ENTITY);

    case KEYWORDS.PLAYER:
      return utils.classify(parseEntity(tokens), TAXONOMIES.PLAYER_ENTITY);

    case KEYWORDS.FULL_ENTITY:
      return utils.classify(parseEntity(tokens), TAXONOMIES.FULL_ENTITY);

    case KEYWORDS.CREATE_GAME:
      return utils.classify(parseCreateGame(tokens), TAXONOMIES.CREATE_GAME);

    case KEYWORDS.ACTION_START:
      return utils.classify(parseAction(tokens), TAXONOMIES.ACTION);

    // ignored lines (unimportant)
    case KEYWORDS.M_CURRENT_TASK_LIST:
    case KEYWORDS.COUNT:
    case KEYWORDS.ID:
    case KEYWORDS.SELECTED_OPTION:
    case KEYWORDS.ACTION_START_TASKLIST:
    case KEYWORDS.ACTION_END:
      return undefined;

    default:
      debug('No parser found:', tokens[0]);
      return undefined;
  }
}

function decode(tree) {
  var res = parse(tree);
  if (!res)
    return undefined;

  switch (res.taxonomy) {
    case TAXONOMIES.TAG_CHANGE:
      return [EVENTS.TAG_CHANGE, res];
    case TAXONOMIES.FULL_ENTITY:
      return [EVENTS.FULL_ENTITY, decodeEntity(tree)];
    case TAXONOMIES.CREATE_GAME:
      return [EVENTS.CREATE_GAME, decodeCreateGame(tree)];
    case TAXONOMIES.ACTION:
      return [EVENTS.ACTION, decodeAction(tree)];
    default:
      debug('No decoder found:', res.taxonomy);
      return undefined;
  }
}

module.exports = {
  decode
};