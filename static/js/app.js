var runeBox = angular.module('runeBox', []);

runeBox.controller('RuneBoxCtrl', function($scope, $http){
	$scope.downloads = _downloads;
	$scope.makeDownload = function(downloadObject){
		$http.post('/scp', {data: downloadObject})
		.then(function(response){
			console.log(response);
		})
	}
});