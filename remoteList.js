/* config */
var config = require('./config.json')
var downloadsDir = config.downloadsDir;


/* packages */
var fs = require('fs');
var moment = require('moment');
var express = require('express');

/* Express setup */
var app = express();

app.get('/', function (req, res) {
	var downloads = fs.readdirSync(downloadsDir);
	downloads.sort(function(a, b) {
	    return fs.statSync(downloadsDir + a).mtime.getTime() - fs.statSync(downloadsDir + b).mtime.getTime();
	});
	downloads.reverse();
	var sortedDownloads = [];
	downloads.forEach(function(file){
		var filePath = downloadsDir + file;
		var fileDate = fs.statSync(filePath).mtime.getTime()
		var fromNow = moment(fileDate).fromNow();
		var fileObject = {
			"path" : filePath,
			"time" : fileDate,
			"fromNow": fromNow
		};
		sortedDownloads.push(fileObject);
	});
	res.json(sortedDownloads);
});

app.listen(config.remotePort, function () {
  console.log('Remote file list running on port: ' + config.remotePort);
});