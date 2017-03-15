$('document').ready(function(){
	var baffleHeader = baffle('.baffleHeader', {
		speed: 100
	}).start();
	function revealBaffle(){
		baffleHeader.reveal(1500);
	};
	revealBaffle();
	setInterval(function(){
		baffleHeader.start();
		baffleHeader.reveal(2000);
	}, 5000)
});

var runeBox = angular.module('runeBox', []);

runeBox.controller('PlayerCtrl',function($scope, $http){
	var mopidy = new Mopidy({
    	webSocketUrl: "ws://raspberrypi.local:6680/mopidy/ws/",
    	callingConvention: "by-position-or-by-name"
	});
	mopidy.on("state:online", function () {
	    mopidyConnected = true;
	    mopidy.playback.getCurrentTlTrack().then(function(data){
	    	handleTrack(data.track);
	    });
	    mopidy.library.browse({"uri":'file:///media/BLACK/FLAC'}).then(function(data){
  			console.log(data);
		});
	});

	mopidy.on("event:trackPlaybackStarted", function () {
	    mopidy.playback.getCurrentTlTrack().then(function(data){
	    	handleTrack(data.track);
	    });
	})
	$scope.getTrackList + function(){
		mopidy.tracklist.getTracks()
	    .then(function(data){
	    	console.log(data);
	    	$scope.currentTrackList = data;
	    });
	}

	$http.get('/currentUser')
	.then(function(user){
		$scope.currentUser = user.data;
	});

	function handleTrack(track){
	  $scope.currentTrack = track;
      $scope.currentTrack.formattedTime = moment(track.length).format('mm:ss');
      $scope.$apply();
	}
})

runeBox.controller('HomeCtrl', function($scope, $http){

})

runeBox.controller('RuneBoxCtrl', function($scope, $http){
	$scope.downloads = _downloads;
	$scope.existingDir;
	$scope.selectDir = function(downloadObject){
		$scope.selectedDownload = downloadObject;	
		$('#selectDirModal').modal('show');
		$http.get('/ls')
		.then(function(dirList){
			$scope.dirs = dirList.data;			
		});
	};

	$scope.doDownload = function(){
		if ( typeof $scope.newDir != "undefined" && $scope.newDir.length > 0 ){
			$scope.targetDir = $scope.newDir;
		} else {
			$scope.targetDir = $scope.existingDir; 
		};
		$http.post('/scp', {'dir': $scope.selectedDownload, 'target': $scope.targetDir})
		.then(function(response){
			console.log(response);
			$('#selectDirModal').modal('hide');
			$scope.newDir = '';
		});
	};
});