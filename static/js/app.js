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