var tokenize = require('./tokenize');
var taxonomize = require('./taxonomize');
var parser = require('./parser');
var assign = require('object-assign');
var assert = require('assert');
var debug = require('debug')('Parse.Zone');

function parseTransition(tokens) {
  assert(tokens.shift() === 'TRANSITIONING');
  assert(tokens.shift() === 'card');
  var o = parser.parseTagArray(tokens);
  assert(tokens.shift() === 'to');
  if (tokens[0]) {
    // field and zone qualifier present
    var field = tokens.shift();
    assert(['FRIENDLY', 'OPPOSING'].indexOf(field) !== -1);
    o.field = field;

    var destZone = tokens.shift();
    assert(['DECK', 'HAND', 'GRAVEYARD', 'PLAY', 'SECRET'].indexOf(destZone) !== -1);
    o.destZone = destZone;

    if (tokens[0]) {
      // card type qualifier present
      assert(tokens.shift() === '(');
      var cardType = parser.parseValue(tokens);
      assert(['Hero', 'Hero Power', 'Weapon'].indexOf(cardType) !== -1);
      o.cardType = cardType;
      assert(tokens.shift() === ')');
    }
  }
  return o;
}

module.exports = function parse(chunk, classify) {
  var tokens = tokenize(chunk.raw);

  var taxonomy;
  var result;

  switch(tokens[0]) {
  case 'TRANSITIONING':
    result = parseTransition(tokens);
    taxonomy = 'TRANSITIONING';
    break;
  default:
    debug('no parser found:', chunk.raw);
    return undefined;
  }

  return classify ? taxonomize(result, taxonomy) : result;
}