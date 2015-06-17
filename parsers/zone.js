var tokenize = require('./tokenize');
var taxonomize = require('./taxonomize');
var utils = require('./utils');
var assign = require('object-assign');
var assert = require('assert');
var debug = require('debug')('Parse.Zone');

//constants
var TAXONOMIES = require('../constants').TAXONOMIES.ZONE;
var LOG = require('../constants').LOG.ZONE;

function parseZone(tokens) {
  switch(tokens[0]) {
  case '':
    tokens.shift();
    return {};
  case 'FRIENDLY':
  case 'OPPOSING':
    var o = {
      field: tokens.shift(),
      zone: tokens.shift(),
    }
    if (tokens[0] === '(') {
      // card type qualifier is present
      assert(tokens.shift() === '(');
      var cardType = utils.parseValue(tokens);
      assert(['Hero', 'Hero Power', 'Weapon'].indexOf(cardType) !== -1);
      assert(tokens.shift() === ')');
      o.cardType = cardType;
    }
    return o;
  default:
    var n = tokens.shift();
    assert(!isNaN(n));
    return {index: n}
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

function parseLocalChange(chunk) {
  return {};
}

function parseFinishChange(chunk) {
  return {};
}

module.exports = function parse(chunk, classify) {
  var tokens = tokenize(chunk.raw);

  var taxonomy;
  var result;

  switch(tokens[0]) {
  case LOG.TRANSITIONING:
    result = parseTransition(tokens);
    taxonomy = 'TRANSITIONING';
    break;

  case LOG.ID:
    switch(true) {
    case !!chunk.func.match(/ProcessChanges/):
      result = parseZoneChange(tokens);
      taxonomy = TAXONOMIES.ZONE_CHANGE;
      break;

    case !!chunk.func.match(/LocalChangesFromTrigger/):
      result = parseLocalChange(tokens);
      taxonomy = TAXONOMIES.LOCAL_CHANGE;
      break;

    case !!chunk.func.match(/Finish/):
      result = parseFinishChange(tokens);
      taxonomy = TAXONOMIES.FINISH_CHANGE;
      break;

    default:
      debug('no id parser found:', chunk.func, chunk.raw);
      return undefined;
    }
    break;

  default:
    debug('no parser found:', chunk.raw);
    return undefined;
  }

  return classify ? taxonomize(result, taxonomy) : result;
}