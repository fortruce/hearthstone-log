require('babel/register');

var hs = require('./hearthstone');
var fs = require('fs');

var logFile = 'C:\\Program Files (x86)\\Hearthstone\\Hearthstone_Data\\output_log.txt';

var prevSize = fs.statSync(logFile).size;
fs.watchFile(logFile, function (event, filename) {
	if (event.size > prevSize) {
		console.log('size delta:', event.size - prevSize);
		var chunk = fs.createReadStream(logFile, {
			start: prevSize + 1,
			end: event.size
		});
		chunk.on('data', function (data) {
			console.log(data.toString());
		});

		prevSize = event.size;
		console.log('\n\n\n');
	}
});