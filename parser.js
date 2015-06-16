var assign = require('object-assign');
var util = require('util');
var Writable = require('stream').Writable;
var EventEmitter = require('events').EventEmitter;

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

function parseTagArray(tokens) {
  console.log('parseTagArray', tokens.join(', '));
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

function parseValue(tokens) {
  console.log('parseValue', tokens.join(', '));
  var val;
  if (tokens[0] === '[') {
    val = parseTagArray(tokens);
  } else {
    val = tokens.shift();
    // continue to consume until the token after next is '=' or undefined
    // for values with spaces in their names: 'name=Defias Bandit id=73'
    // alt-solution: change tokenizer to actual token elements
    // that indicate if they are keys (look ahead for '=')
    while (tokens[1] !== undefined && tokens[1] !== '=' && tokens[0] !== ']') {
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

function parseKeyValues(tokens) {
  var o = Object.create(null);
  do {
    o = assign(o, parseKeyValuePair(tokens));
  } while (tokens.length > 0);
  return o;
}

function parseTagChange(tokens) {
  assert(tokens.shift() === 'TAG_CHANGE');
  return parseKeyValues(tokens);
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

function parseEntity(tokens) {
  var entityType = tokens.shift();
  assert(['GameEntity', 'Player', 'FULL_ENTITY'].indexOf(entityType) !== -1);
  if (entityType === 'FULL_ENTITY') {
    // consume extra tokens in FULL_ENTITY denoted by ()
    // FULL_ENTITY (- Creating) ID=5 CardID=CS2_101
    assert(tokens.shift() === '-');
    assert(tokens.shift() === 'Creating');
  }
  var entity = parseKeyValues(tokens);
  entity.entity = entityType;
  return entity;
}

function parseTransition(tokens) {
  assert(tokens.shift() === 'TRANSITIONING');
  assert(tokens.shift() === 'card');
  var o = parseTagArray(tokens);
  assert(tokens.shift() === 'to');
  if (tokens[0]) {
    // field and zone qualifier present
    var field = tokens.shift();
    assert(['FRIENDLY', 'OPPOSING'].indexOf(field) !== -1);
    o.field = field;

    var zone = tokens.shift();
    assert(['DECK', 'HAND', 'GRAVEYARD', 'PLAY', 'SECRET'].indexOf(zone) !== -1);
    o.zone = zone;

    if (tokens[0]) {
      // card type qualifier present
      assert(tokens.shift() === '(');
      var cardType = parseValue(tokens);
      assert(['Hero', 'Hero Power', 'Weapon'].indexOf(cardType) !== -1);
      o.cardType = cardType;
      assert(tokens.shift() === ')');
    }
  }
  return o;
}

function typeify(o, type) {
  o.type = type;
  return o;
}

function parse(line) {
  assert(typeof line === 'string');
  var tokens = tokenize(line);
  switch (tokens[0]) {
  case 'TAG_CHANGE':
    return typeify(parseTagChange(tokens), 'TAG_CHANGE');
  case 'tag':
    return typeify(parseTagValuePair(tokens), 'TAG');
  case 'GameEntity':
    return typeify(parseEntity(tokens), 'GAME_ENTITY');
  case 'Player':
    return typeify(parseEntity(tokens), 'PLAYER_ENTITY');
  case 'FULL_ENTITY':
    return typeify(parseEntity(tokens), 'FULL_ENTITY');
  case 'TRANSITIONING':
    return typeify(parseTransition(tokens), 'TRANSITIONING');

  // ignored log lines
  case 'processing':
  case 'taskListId':
  case 'm_currentTaskList':
  case 'Count':
  case 'm_id':
    return undefined;

  // unhandled log lines
  default:
    console.log('[ERROR] No parse method found:', tokens[0]);
    return undefined;
  }
}

// -------------------------- Interpreter -----------------------------

function decodeTags(chunk) {
  return chunk.children.map(function (c) {
    return parse(c.raw);
  }).reduce(function (col, tag) {
    col[tag.tag] = tag.value;
    return col;
  }, {});
}

function decodeEntity(chunk) {
  var entity = parse(chunk.raw);
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
    type: 'CREATE_GAME',
    game: game,
    players: [player1, player2]
  }
}

function decodeTransition(chunk) {
  assert(chunk.children == undefined);
  return parse(chunk.raw);
}

function decodeTagChange(chunk) {
  assert(chunk.children == undefined);
  return parse(chunk.raw);
}

// Decode the {raw: '', children: [...]} chunk into a specific log event
function decode(chunk) {
  var key = parse(chunk.raw);

  if (!key)
    return undefined;

  switch (key.type) {
  case 'TAG_CHANGE':
    return decodeTagChange(chunk);
  case 'CREATE_GAME':
    return decodeCreateGame(chunk);
  case 'FULL_ENTITY':
    return decodeEntity(chunk);
  case 'TRANSITIONING':
    return decodeTransition(chunk);
  default:
    console.log('[ERROR] No decode method found:', key.type);
    return undefined;
  }
}

// HSDecode decodes incoming log objects into log events that it fires.
// It silently consumes the stream piped into it.
function HSDecode() {
  if (!(this instanceof HSDecode)) return new HSDecode();

  Writable.call(this, {objectMode: true});
  EventEmitter.call(this);
}
util.inherits(HSDecode, Writable);
util.inherits(HSDecode, EventEmitter);

HSDecode.prototype._write = function(chunk, enc, next) {
  var ev = decode(chunk);
  if (ev)
    this.emit(ev.type, ev);
  next();
};

// -------------------------- Interpreter -----------------------------

module.exports = {
  parseValue,
  parseKeyValuePair,
  parseTagArray,
  parseTagChange,
  parseTagValuePair,
  parseSimpleValue,
  parseTransition,
  tokenize,
  parse,
  decode,
  decodeCreateGame,
  decodeEntity
};