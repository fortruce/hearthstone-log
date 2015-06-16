var Writable = require('stream').Writable;
var util = require('util');

// JsonStream is a writable stream that collects multiple json object chunks
// and concats them into a single array of json objects, calling the callback
// on the result.
function JsonStream(cb) {
  // don't require the use of the new keyword for consumers
  if (!(this instanceof JsonStream))
    return new JsonStream(cb);

  Writable.call(this, {objectMode: true});
  this.body = [];

  this.on('finish', function () { cb(this.body); });
}
util.inherits(JsonStream, Writable);

JsonStream.prototype._write = function (chunk, enc, next) {
  this.body.push(chunk);
  next();
};

module.exports = JsonStream;