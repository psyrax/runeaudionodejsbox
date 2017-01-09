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
  		//console.log(data);
	});
	searchMopidy();
});

function searchMopidy(){
	mopidy.library.search({"query":"cranes"}).then(function(data){
  		console.log(data);
	});
}

