var Transform = require('stream').Transform;
var fs = require('fs');
var split = require('split');
var through = require('through2');
var debug = require('debug');
var assert = require('assert');

var logFile = 'output_log.txt';

function filter(regex) {
  return through(function (chunk, enc, callback) {
    var res = chunk.toString().match(regex);
    if (res) {
      this.push(res[2]);
    }
    callback();
  });
}

function join(sep) {
  var start = true;
  return through(function (chunk, enc, callback) {
    if (start) {
      this.push(chunk);
      start = false;
    } else {
      this.push(sep);
      this.push(chunk);
    }
    callback();
  });
}

function countIndent(s) {
  return s.length - s.trimLeft().length;
}

function Node(chunk, parent) {
  this.value = chunk.value;
  this.level = chunk.level;
  this.parent = parent;
  this.children = [];
}

Node.prototype.addChild = function(chunk) {
  var node = new Node(chunk, this);
  this.children.push(node);
  return node;
}

Node.prototype.neuter = function() {
  var n = Object.create(null);
  n.value = this.value;
  if (this.children.length > 0) {
    n.children = this.children.map(function (x) { return x.neuter(); });
  }
  return n;
}

function Tree(chunk) {
  this.root = new Node(chunk);
  this.cur = this.root;
}

// Push a chunk onto the current indent level
Tree.prototype.push = function(chunk) {
  // cannot push onto a non-indented tree
  assert(this.cur !== this.root);

  // add chunk to the current elements parent
  // this chunk is now cur
  this.cur = this.cur.parent.addChild(chunk);
}

// Indent tree with current chunk
Tree.prototype.indent = function(chunk) {
  this.cur = this.cur.addChild(chunk);
}

Tree.prototype.deindent = function(level) {
  while(this.cur.level > level) {
    this.cur = this.cur.parent;
  }
}

Tree.prototype.level = function() {
  return this.cur.level;
}

Tree.prototype.toString = function() {
  return JSON.stringify(this.root.neuter(), undefined, 2);
}

function parse() {
  var tree = undefined;
  return through(function (chunk, enc, callback) {
    chunk = JSON.parse(chunk);
    if (!tree) {
      tree = new Tree(chunk);
      return callback();
    }

    if (chunk.level === 0) {
      if (tree) {
        this.push(tree.toString());
      }

      tree = new Tree(chunk);
    } else if (chunk.level === tree.level()) {
      tree.push(chunk);
    } else if (chunk.level > tree.level()) {
      tree.indent(chunk);
    } else if (chunk.level < tree.level()) {
      tree.deindent(chunk.level);
      tree.push(chunk);
    }

    return callback();
  });
}

var treeify = through(function (chunk, enc, callback) {
  var s = chunk.toString();
  this.push(JSON.stringify({'value': s,
                            'level': countIndent(s)}));
  return callback();
});

var levels = {};
fs.createReadStream(logFile)
  .pipe(split())
  .pipe(filter(/^\[(Power|Zone)\] .*? - (.*)$/))
  .pipe(treeify)
  .pipe(parse())
  .pipe(join('\n'))
  .pipe(fs.createWriteStream('parseTestOut.txt'));