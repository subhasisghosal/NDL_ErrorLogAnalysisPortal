// var app = angular.module('metadataapp', ['ngMaterial', 'ngMessages']);

logApp.controller('totalCtrl', function($rootScope, $scope, $timeout, $location, $http, config, userInfoService) {
	
	$scope.selectedList = [];
	$scope.selectedLevel = "Levels";
	$scope.selectedItem = "Errors/Warning";

	$scope.availableItems = [];
	$scope.collectionName = userInfoService.getCollection()
	
	$scope.levels = [];
	$scope.levels.push({name: "All", value:"all",isAttempted: false});
	$scope.levels.push({name: "Item Level", value:"itemLevel", isAttempted:false});
	$scope.levels.push({name: "Metadata Level", value:"metadataLevel", isAttempted:false});
	$scope.levels.push({name: "Source Level", value:"sourceLevel", isAttempted:false});

	$scope.items = [];
	$scope.items.push({name: "All", value:"all", isAttempted: false});
	$scope.items.push({name: "Errors", value:"err", isAttempted: false});
	$scope.items.push({name: "Warnings", value:"warn", isAttempted: false});

	// var url = "http://10.146.95.172:3000/api/report";
	var url = config.serverUrl + "/api/report";

console.log($scope.collectionName)

	$scope.getLevelName = function(level){
		for(i in $scope.levels){
			if( $scope.levels[i].value == level )
				return $scope.levels[i].name
		}
	}

	$scope.setLevel = function(level){
		// console.log(selectedLevel)
		$scope.selectedOptionlevel = level.value;
		if(level.isAttempted === false){
			level.isAttempted= true;
			for(var i=0;i<$scope.levels.length;i++){
				if(level.value != $scope.levels[i].value)
					$scope.levels[i].isAttempted= false;
			}
		} else {
			level.isAttempted= false;
		}
	};
	
	$scope.setItem = function(item){
		// console.log(selectedType)
		$scope.selectedOptionItem = item.value;
		if(item.isAttempted === false){
			item.isAttempted= true;
			for(var i=0;i<$scope.items.length;i++){
				if(item.value != $scope.items[i].value)
					$scope.items[i].isAttempted= false;
			}
		} else {
			item.isAttempted= false;
		}
	};
	
	$scope.availableItems = []
	$scope.getArray = []
	$scope.getHeader = function () {return ["Information Code", "Level", "Count"]};
	$scope.submitList = function(){
			//$http.post(){}
			$scope.availableItems=[];
			$scope.getArray = []
			var data = {
				"collectionName": $scope.collectionName,
				"level": $scope.selectedOptionlevel,
				"flag": $scope.selectedOptionItem
			};
			// console.log(data);
			var responsePromise = $http.post(url,data);
			responsePromise.then(function(response) {
					$scope.leftListObtained = true;
                    var availabledata = response.data.item;	
					for(var i=0;i<availabledata.length;i++){
						$scope.availableItems.push({ value : availabledata[i].name, count : availabledata[i].count, level : $scope.getLevelName(availabledata[i].level)});
						$scope.getArray.push({ value : availabledata[i].name, level : $scope.getLevelName(availabledata[i].level), count : availabledata[i].count});
					}
					console.log(JSON.parse(angular.toJson($scope.availableItems)));
                });
				
	};
	
	$scope.generateCSV = function(){
		
	};

	//$scope.getArray = JSON.parse(angular.toJson($scope.availableItems))

	//$scope.$apply();


});
