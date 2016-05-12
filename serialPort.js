var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var shell = require('shelljs');

var selectedPort;
var prevVol = 0;

serialport.list(function (err, ports) {
  ports.forEach(function(port) {
    if ( typeof port.manufacturer!= "undefined" && port.manufacturer.indexOf("Arduino") != null ){
    	runPort(port);
    }
  });
});

function runPort(port){
	console.log('selected: ', port.comName);
	selectedPort = new SerialPort( port.comName, {
		parser: serialport.parsers.readline('\n'),
		baudrate: 9600
	});
	selectedPort.on('open', function (err) {
			if (err) {
			return console.log('Error opening port: ', err.message);
			}
			console.log('Port open');
	});
	selectedPort.on('data', function (data) {
		controlData = JSON.parse(data);
		console.log("vol:", controlData.volume);
		if ( prevVol != controlData.volume ){
			//setVol
			console.log('change to:', controlData.volume);
			console.log('from:', prevVol);
			changeVol(controlData.volume);
		};
		prevVol = controlData.volume;
	});
	
}

function changeVol(vol){
	if (shell.exec('amixer -c 1 sset PCM,0 '+ vol + '%').code !== 0) {
  		console.log('Error: Volume change failed');
	}
}