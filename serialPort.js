var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var shell = require('shelljs');
shell.config.silent = true;

var selectedPort;
var prevVol = 0;
var dataCheck = 0;


serialport.list(function (err, ports) {
  ports.forEach(function(port) {
    if ( typeof port.manufacturer!= "undefined" && port.manufacturer.indexOf("Arduino") != null ){
    	runPort(port);
    }
  });
});

function runPort(port){
	selectedPort = new SerialPort( port.comName, {
		parser: serialport.parsers.readline('\n'),
		baudrate: 9600
	});
	selectedPort.on('open', function (err) {
			if (err) {
			return console.log('Error opening port: ', err.message);
			}
	});
	selectedPort.on('data', function (data) {	

		controlData = JSON.parse(data);
		if ( prevVol != controlData.volume ){
			//setVol
			var absVol = 100 - parseInt(controlData.volume);

			prevVol = absVol;
			changeVol(absVol);
		};
		
		if ( controlData.toggle ){

		}
		
	});
	
}

function changeVol(vol){
	if (shell.exec('amixer -c 1 sset PCM,0 '+ vol + '%').code !== 0) {
  		console.log('Error: Volume change failed');
	}
}
function toggleMusic(){
	if (shell.exec('mpc toggle').code !== 0) {
  		console.log('Error: Volume change failed');
	}
}