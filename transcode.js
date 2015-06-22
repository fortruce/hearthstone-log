var split = require('split');
var through = require('through2');
var assert = require('assert');
var debug = require('debug')('transcode');

function filter() {
  return through({objectMode: true},
    function (chunk, enc, callback) {
      var res = chunk.toString().match(/^\[([A-Za-z]*)\] (.*?) - (.*)$/);
      if (res) {
        this.push({
          log: res[1],
          func: res[2],
          raw: res[3].trim(),
          level: countIndent(res[3])
        });
      }
      callback();
    }
  );
}

function countIndent(s) {
  return s.length - s.trimLeft().length;
}

function Node(chunk, parent) {
  this.raw = chunk.raw;
  this.func = chunk.func;
  this.log = chunk.log
  this.level = chunk.level;
  this.parent = parent;
  this.children = [];
}

Node.prototype.addChild = function(chunk) {
  var node = new Node(chunk, this);
  this.children.push(node);
  return node;
};

Node.prototype.neuter = function() {
  var n = Object.create(null);
  n.raw = this.raw;
  n.log = this.log;
  n.func = this.func;
  if (this.children.length > 0) {
    n.children = this.children.map(function (x) { return x.neuter(); });
  }
  return n;
};

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
};

// Indent tree with current chunk
Tree.prototype.indent = function(chunk) {
  this.cur = this.cur.addChild(chunk);
};

Tree.prototype.deindent = function(level) {
  while(this.cur.level > level) {
    this.cur = this.cur.parent;
  }
};

Tree.prototype.level = function() {
  return this.cur.level;
};

Tree.prototype.neuter = function() {
  return this.root.neuter();
};

// Parse tracks parent/child relationships indicated by indented text.
// The input must first be 'treeified'.
function transcode() {
  var tree;
  return through({objectMode: true},
    function (chunk, enc, callback) {
      if (!tree) {
        tree = new Tree(chunk);
        return callback();
      }

      if (chunk.level === 0) {
        if (tree) {
          this.push(tree.neuter());
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
    }
  );
}

module.exports = function (stream) {
  return stream.pipe(split())
  .pipe(filter())
  .pipe(transcode());
};