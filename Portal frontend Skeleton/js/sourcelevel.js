var app = angular.module('metadataapp', []);

app.controller('sourceCtrl', function($scope,$http) {
	$scope.availableOptions = [];
	$scope.leftListObtained = false;
	$scope.selectedList = [];
	$scope.rightListObtained = false;
	$scope.prevchoice = 'informationCode';

	$scope.availableItems = [];
	$scope.selectedOption = 'informationCode';
	$scope.collectionName = "test_source";
	$scope.flag = false;
	
	var url = "http://10.146.95.172:3010/api/sourcelevel";
	$scope.setChoice = function(choice){
		$scope.selectedOption = choice;
		if(choice === 'informationCode')
			$scope.flag=true;
		else if(choice === 'handle')
			$scope.flag = false;
	};
	
	$scope.submitList = function(){
			//$http.post(){}
		if(($scope.selectedList.length === 0 || $scope.prevchoice === 'handle') && $scope.selectedOption === 'informationCode'){
			$scope.availableOptions = [];
			$scope.selectedList = [];
			$scope.availableItems = [];
			$scope.prevchoice = 'informationCode';

			
			var data = {
				"collectionName": $scope.collectionName,
				"choice": $scope.selectedOption,
				"informationCode": "NULL",
				"handle" : "NULL"
			};
			var responsePromise = $http.post(url,data);
			responsePromise.then(function(response) {
					$scope.leftListObtained = true;
                    var availabledata = response.data.item;	
					for(var i=0;i<availabledata.length;i++){
						$scope.availableOptions.push({ value : availabledata[i].name, isAttempted : false, count : availabledata[i].count  });
					}
                });
				
		} else if (($scope.selectedList.length === 0 || $scope.prevchoice === 'informationCode') && $scope.selectedOption === 'handle'){
			$scope.availableOptions = [];
			$scope.selectedList = [];
			$scope.availableItems = [];
			$scope.prevchoice = 'handle';


			var data = {
				"collectionName": $scope.collectionName,
				"choice": $scope.selectedOption,
				"informationCode": "NULL",
				"handle" : "NULL"
			};
			var responsePromise = $http.post(url,data);
			responsePromise.then(function(response) {
                    var availabledata = response.data.item;	
					for(var i=0;i<availabledata.length;i++){
						$scope.availableOptions.push({ value : availabledata[i].name, isAttempted : false, count : availabledata[i].count  });
					}

                });
           
				$scope.leftListObtained = true;
				
		} else if ($scope.selectedList.length > 0 && $scope.selectedOption === 'handle'){
				
				console.log($scope.selectedList);
				
				$scope.availableItems = [];
				$scope.rightListObtained = true;

				
				var handleResult = $scope.selectedList.map(function(item) {
					return '"' + item + '"';
				});
				var handleValue = handleResult.join(', ');
				
				console.log(handleValue);
				
			var data = {
				"collectionName": $scope.collectionName,
				"choice": $scope.selectedOption,
				"informationCode": "NULL",
				"pageToken" : 1,
				"handle" : handleValue
			};
			var responsePromise = $http.post(url,data);
			responsePromise.then(function(response) {
                     $scope.availableItems = response.data.items;	
					 console.log($scope.availableItems);
                });
            
				$scope.leftListObtained = true;
				//$scope.selectedList=[];
				
		} else if($scope.selectedList.length > 0 && $scope.selectedOption === 'informationCode'){
				console.log($scope.selectedList);
				
				$scope.availableItems = [];
				$scope.rightListObtained = true;
				
				var infoCodeResult = $scope.selectedList.map(function(item) {
					return '"' + item + '"';
				});
				
				var infoCodeValue = infoCodeResult.join(', ');
				
				console.log(infoCodeValue);
				
			var data = {
				"collectionName": $scope.collectionName,
				"choice": $scope.selectedOption,
				"informationCode": infoCodeValue ,
				"pageToken" : 1,
				"handle" : "NULL"
			};
			var responsePromise = $http.post(url,data);
			responsePromise.then(function(response) {
                     $scope.availableItems = response.data.handles;	
					 console.log($scope.availableItems);
                });
            
				$scope.leftListObtained = true;
				//$scope.selectedList=[];
			}
	};
	

	$scope.optionAttempted= function(item){
		if(item.isAttempted === true){
			item.isAttempted = false;
			var index = $scope.selectedList.indexOf(item.value);
			if (index > -1) {
				$scope.selectedList.splice(index, 1);
			}
		}
		else{
			item.isAttempted = true;
			$scope.selectedList.push(item.value);
		}
	};
	
	$scope.generateCSV = function(){
		
	};


});
