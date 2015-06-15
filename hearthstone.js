var assign = require('object-assign');

function tokenize(header) {
  var elements = [];
  var curElement = '';
  for (var i = 0; i < header.length; i++) {
    switch (header[i]) {
    case ' ':
      elements.push(curElement);
      curElement = '';
      break;
    case ']':
    case '=':
      elements.push(curElement);
      elements.push(header[i]);
      curElement = '';
      break;
    case '[':
      elements.push('[');
      break;
    default:
      curElement += header[i];
      break;
    }
  }
  if (curElement)
    elements.push(curElement);
  return elements;
}

function Entity(entityStr) {
  var lines = entityStr.trim().split('\r\n');
  // Add initial entity header values 'EntityID=2'
  var header = tokenize(lines[0]);
  // Add properties for each 'tag=XXX value=YYY' in the entity
  for (var i = 1; i < lines.length; i++) {
    var tag = lines[i].trim()
                      .split(' ')
                      .map(l => l.split('=').pop());
    this[tag[0]] = tag[1];
  }
}

function parseTagArray(tokens) {
  console.log('parseTagArray', tokens.join(', '));
  var o = Object.create(null);
  do {
    o = assign(o, parseKeyValuePair(tokens));
  } while (tokens[0] !== ']');
  assert(tokens.shift() === ']');
  assert(tokens.shift() === '');
  return o;
}

function parseValue(tokens) {
  console.log('parseValue', tokens.join(', '));
  var val = tokens.shift();
  if (val === '[') {
    val = parseTagArray(tokens);
  } else {
    // continue to consume until the token after next is '=' or undefined
    // for values with spaces in their names: 'name=Defias Bandit id=73'
    // alt-solution: change tokenizer to actual token elements
    // that indicate if they are keys (look ahead for '=')
    while (tokens[1] !== undefined && tokens[1] !== '=' && tokens[0] !== ']') {
      console.log(tokens);
      val += ' ' + tokens.shift();
    }
  }
  return val;
}

function parseKeyValuePair(tokens) {
  console.log('parseKeyValuePair:', tokens.join(', '));

  var key = tokens.shift();
  assert(tokens.shift() === '=');
  var value = parseValue(tokens);
  var o = Object.create(null);
  o[key] = value;
  return o;
}

function parseTagChange(tokens) {
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

function parse(line) {
  var tokens = tokenize(line);
  switch (tokens[0]) {
  case 'TAG_CHANGE':
    assert(tokens.shift() === 'TAG_CHANGE');
    return parseTagChange(tokens);
  case 'tag':
    return parseTagValuePair(tokens);
  default:
    return undefined;
  }
}

module.exports = {
  parseValue,
  parseKeyValuePair,
  parseTagArray,
  parseTagChange,
  parseTagValuePair,
  parseSimpleValue,
  Entity,
  tokenize,
  parse
};