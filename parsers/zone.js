var tokenize = require('./tokenize');
var taxonomize = require('./taxonomize');
var utils = require('./utils');
var assign = require('object-assign');
var assert = require('assert');
var debug = require('debug')('Parse.Zone');

//constants
var TAXONOMIES = require('../constants').TAXONOMIES.ZONE;
var KEYWORDS = require('../constants').KEYWORDS.ZONE;

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

module.exports = function parse(chunk, classify) {
  var tokens = tokenize(chunk.raw);

  var taxonomy;
  var result;

  switch(tokens[0]) {
  case KEYWORDS.TRANSITIONING:
    result = parseTransition(tokens);
    taxonomy = TAXONOMIES.TRANSITIONING;
    break;

  case KEYWORDS.ID:
    switch(true) {
    case !!chunk.func.match(KEYWORDS.PROCESS_CHANGES):
      result = parseZoneChange(tokens);
      taxonomy = TAXONOMIES.ZONE_CHANGE;
      break;

    case !!chunk.func.match(KEYWORDS.FINISH):
    case !!chunk.func.match(KEYWORDS.LOCAL_CHANGES):
      return undefined;

    default:
      debug('no id parser found:', chunk.func, chunk.raw);
      return undefined;
    }
    break;

  // silently ignore (unimportant log)
  case KEYWORDS.M_ID:
  case KEYWORDS.TASK_LIST_ID:
  case KEYWORDS.SRC_ZONE:
  case KEYWORDS.SRC_POS:
  case KEYWORDS.CHANGE_LIST_ID:
  case KEYWORDS.BRACKET_ID:
    return undefined;

  default:
    debug('no parser found:', chunk.raw);
    return undefined;
  }

  return classify ? taxonomize(result, taxonomy) : result;
};