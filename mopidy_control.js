/* Config options */
var config = require("./config.json");
var Mopidy = require("mopidy");

var mopidy = new Mopidy({
    webSocketUrl: config.mopidyURL,
    callingConvention: "by-position-or-by-name"
});

mopidy.on("state:online", function () {
    mopidyConnected = true;
    mopidy.playback.getCurrentTlTrack().then(function(data){
  		console.log(data);
    });
});

mopidy.on("event:trackPlaybackStarted", function () {
    mopidy.playback.getCurrentTlTrack().then(function(data){
      console.log(data);
    });
});
