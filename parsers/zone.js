var utils = require('./utils');
var tokenize = require('./tokenize');
var assign = require('object-assign');
var assert = require('assert');
var debug = require('debug')('Handler.Zone');

var constants = require('../constants');
var KEYWORDS = constants.KEYWORDS.ZONE;
var TAXONOMIES = constants.TAXONOMIES.ZONE;
var EVENTS = constants.EVENTS;

/*
          PARSER FUNCTIONS
 */

function parseZone(tokens) {
  switch(tokens[0]) {
  case '':
  case undefined:
    tokens.shift();
    return {};
  case 'FRIENDLY':
  case 'OPPOSING':
    var o = {
      field: tokens.shift(),
      zone: tokens.shift(),
    };
    if (tokens[0] === '(') {
      // card type qualifier is present
      assert(tokens.shift() === '(');
      var cardType = utils.parseValue(tokens);
      assert(['Hero', 'Hero Power', 'Weapon'].indexOf(cardType) !== -1);
      assert(tokens.shift() === ')');
      if (tokens[0] === '')
        assert(tokens.shift() === '');
      o.cardType = cardType;
    }
    return o;
  default:
    var n = tokens.shift();
    assert(!isNaN(n));
    return {index: n};
  }
}

function parseTransition(tokens) {
  assert(tokens.shift() === 'TRANSITIONING');
  assert(tokens.shift() === 'card');
  var o = utils.parseTagArray(tokens);
  assert(tokens.shift() === 'to');
  if (tokens[0]) {
    // field and zone qualifier present
    o.to = parseZone(tokens);
  }
  return o;
}

function parseZoneChange(tokens) {
  var o = Object.create(null);
  assign(o, utils.parseKeyValuePair(tokens));
  assign(o, utils.parseKeyValuePair(tokens));

  var tags = utils.parseTagArray(tokens);
  o.tags = tags;

  var type = tokens.shift();
  assert(['zone', 'pos'].indexOf(type) !== -1);
  o.type = type.toUpperCase();

  assert(tokens.shift() === 'from');
  o.from = parseZone(tokens);
  assert(tokens.shift() === '->');
  o.to = parseZone(tokens);
  return o;
}

/*
          DECODER FUNCTIONS
 */

function decodeTransition(chunk) {
  assert(chunk.children === undefined);
  return parse(chunk);
}

function parse(chunk) {
  var tokens = tokenize(chunk.raw);
  switch(tokens[0]) {
    case KEYWORDS.TRANSITIONING:
      return utils.classify(parseTransition(tokens), TAXONOMIES.TRANSITIONING);
    case KEYWORDS.ID:
      switch(true) {
        case !!chunk.func.match(KEYWORDS.PROCESS_CHANGES):
          return utils.classify(parseZoneChange(tokens), TAXONOMIES.ZONE_CHANGE);

        case !!chunk.func.match(KEYWORDS.FINISH):
        case !!chunk.func.match(KEYWORDS.LOCAL_CHANGES):
          return undefined;

        default:
          debug('No parser found (id):', tokens);
          return undefined;
      }
      break;

    // silently ignore (unimportant log)
    case KEYWORDS.M_ID:
    case KEYWORDS.TASK_LIST_ID:
    case KEYWORDS.SRC_ZONE:
    case KEYWORDS.DST_ZONE:
    case KEYWORDS.SRC_POS:
    case KEYWORDS.TRIGGER_ENTITY:
    case KEYWORDS.CHANGE_LIST_ID:
    case KEYWORDS.BRACKET_ID:
    case KEYWORDS.START:
    case KEYWORDS.END:
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
    case TAXONOMIES.TRANSITIONING:
      return [EVENTS.TRANSITION, decodeTransition(tree)];
    case TAXONOMIES.ZONE_CHANGE:
      return [EVENTS.ZONE_CHANGE, res];
    default:
      debug('No decoder found:', res.taxonomy);
      return undefined;
  }
}

module.exports = {
  decode
};