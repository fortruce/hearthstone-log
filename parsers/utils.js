var assign = require('object-assign');
var debug = require('debug')('parser');
var assert = require('assert');

function parseTagArray(tokens) {
  assert(tokens.shift() === '[');
  var o = Object.create(null);
  do {
    o = assign(o, parseKeyValuePair(tokens));
  } while (tokens[0] !== ']');
  assert(tokens.shift() === ']');
  // consume the extra space after arrays if present
  if (tokens[0] === '')
    assert(tokens.shift() === '');
  return o;
}

function parseKeyValuePair(tokens) {
  var key = tokens.shift();
  assert(tokens.shift() === '=');
  var value = parseValue(tokens);
  var o = Object.create(null);
  o[key] = value;
  return o;
}

function parseKeyValues(tokens) {
  var o = Object.create(null);
  do {
    o = assign(o, parseKeyValuePair(tokens));
  } while (tokens.length > 0);
  return o;
}

function parseSimpleValue(tokens) {
  var v = tokens.shift();
  if (!isNaN(v)) {
    return parseInt(v, 10);
  }
  return v;
}

function parseTagValue(tokens) {
  return tokens.shift();
}

function parseTagValuePair(tokens) {
  // tag=CARDTYPE value=GAME
  var o = Object.create(null);

  assert(tokens.shift() === 'tag');
  assert(tokens.shift() === '=');

  var tag = parseTagValue(tokens);
  o.tag = tag;

  assert(tokens.shift() === 'value');
  assert(tokens.shift() === '=');

  var value = parseSimpleValue(tokens);
  o.value = value;
  return o;
}

function parseValue(tokens) {
  var val;
  if (tokens[0] === '[') {
    val = parseTagArray(tokens);
  } else {
    val = tokens.shift();
    // continue to consume until the token after next is '=' or undefined
    // for values with spaces in their names: 'name=Defias Bandit id=73'
    // alt-solution: change tokenizer to actual token elements
    // that indicate if they are keys (look ahead for '=')
    while (tokens[1] !== undefined &&
           tokens[1] !== '=' &&
           tokens[0] !== ']' &&
           tokens[0] !== '[') {
      val += ' ' + tokens.shift();
    }
  }
  return val;
}

module.exports = {
  parseTagArray,
  parseKeyValuePair,
  parseKeyValues,
  parseSimpleValue,
  parseTagValue,
  parseTagValuePair,
  parseValue
};