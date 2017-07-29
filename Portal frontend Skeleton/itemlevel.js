var app = angular.module('metadataapp', []);

app.controller('iCtrl', function($scope,$http) {
	$scope.availableOptions = [];
	$scope.leftListObtained = false;
	$scope.selectedList = [];
	$scope.rightListObtained = false;
	$scope.availableItems = [];
	$scope.selectedOption = 'informationCode';
	$scope.collectionName = "test_source";
	$scope.flag = false;
	
	var url = "http://10.146.95.172:3000/api/itemlevel";
	$scope.setChoice = function(choice){
		$scope.selectedOption = choice;
		if(choice === 'informationCode')
			$scope.flag=true;
		else if(choice === 'fieldName')
			$scope.flag = false;
	};
	
	$scope.submitList = function(){
			//$http.post(){}
		if($scope.selectedList.length === 0 && $scope.selectedOption === 'informationCode'){
			$scope.availableOptions = [];
			$scope.selectedList = [];
			$scope.availableItems = [];
			
			var data = {
				"collectionName": $scope.collectionName,
				"choice": $scope.selectedOption,
				"informationCode": "NULL",
				"fieldName" : "NULL"
			};
			var responsePromise = $http.post(url,data);
			responsePromise.success(function(data, status, headers, config) {
					$scope.leftListObtained = true;
                    var availabledata = data.item;	
					for(var i=0;i<availabledata.length;i++){
						$scope.availableOptions.push({ value : availabledata[i].name, isAttempted : false, count : availabledata[i].count  });
					}
                });
				
            responsePromise.error(function(data, status, headers, config) {
                    alert("AJAX failed!");
                });
		} else if ($scope.selectedList.length === 0 && $scope.selectedOption === 'fieldName'){
			$scope.availableOptions = [];
			$scope.selectedList = [];
			$scope.availableItems = [];

			var data = {
				"collectionName": $scope.collectionName,
				"choice": $scope.selectedOption,
				"informationCode": "NULL",
				"fieldName" : "NULL"
			};
			var responsePromise = $http.post(url,data);
			responsePromise.success(function(data, status, headers) {
                    var availabledata = data.item;	
					for(var i=0;i<availabledata.length;i++){
						$scope.availableOptions.push({ value : availabledata[i].name, isAttempted : false, count : availabledata[i].count  });
					}

                });
            responsePromise.error(function(data, status, headers) {
                    alert("AJAX failed!");
                });
				$scope.leftListObtained = true;
				
		} else if ($scope.selectedList.length > 0 && $scope.selectedOption === 'fieldName'){
				
				console.log($scope.selectedList);
				
				$scope.availableItems = [];
				$scope.rightListObtained = true;

				
				var fieldResult = $scope.selectedList.map(function(item) {
					return '"' + item + '"';
				});
				var fieldNameValue = fieldResult.join(', ');
				
				console.log(fieldNameValue);
				
			var data = {
				"collectionName": $scope.collectionName,
				"choice": $scope.selectedOption,
				"informationCode": "NULL",
				"pageToken" : 1,
				"fieldName" : fieldNameValue
			};
			var responsePromise = $http.post(url,data);
			responsePromise.success(function(data, status, headers) {
                     $scope.availableItems = data.items;	
					 console.log($scope.availableItems);
                });
            responsePromise.error(function(data, status, headers) {
                    alert("AJAX failed!");
                });
				$scope.leftListObtained = true;
				$scope.selectedList=[];
				
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
				"fieldName" : "NULL"
			};
			var responsePromise = $http.post(url,data);
			responsePromise.success(function(data, status, headers) {
                     $scope.availableItems = data.items;	
					 console.log($scope.availableItems);
                });
            responsePromise.error(function(data, status, headers) {
                    alert("AJAX failed!");
                });
				$scope.leftListObtained = true;
				$scope.selectedList=[];
			}
	};
	

	$scope.optionAttempted= function(item){
		$scope.selectedList.push(item.value);
	};
	
	$scope.generateCSV = function(){
		
	};


});
