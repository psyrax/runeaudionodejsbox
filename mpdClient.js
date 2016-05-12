var mpd = require('mpd'),
    cmd = mpd.cmd
var client = mpd.connect({
  port: 6600,
  host: 'runeaudio.local',
});
client.on('ready', function() {
  console.log("ready");
  client.sendCommand(cmd("currentsong", []), function(err, msg){
  	var song =  mpd.parseKeyValueMessage(msg);
  	console.log("Current song: ", song);
  });
  client.sendCommand(cmd("status", []), function(err, msg){
  	if (err) throw err;
  	var song =  mpd.parseKeyValueMessage(msg);
  	console.log("Status: ", song);
  });
  client.sendCommand(cmd("nextsong", []), function(err, msg){
  	//var song =  mpd.parseKeyValueMessage(msg);
  	 if (err) throw err;
  	console.log("Next song: ", msg);
  });
});
client.on('system', function(name) {
  console.log("update", name);
});
client.on('system-player', function() {
  client.sendCommand(cmd("status", []), function(err, msg) {
    if (err) throw err;
    console.log(msg);
  });
});