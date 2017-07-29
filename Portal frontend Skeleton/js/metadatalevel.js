var app = angular.module('metadataapp', []);

app.controller('metadataCtrl', function($scope,$http) {
	$scope.availableOptions = [];
	$scope.leftListObtained = false;
	$scope.selectedList = [];
	$scope.selectedList2 = [];

	$scope.rightListObtained = false;
	$scope.availableItems = [];
	$scope.selectedOption = 'informationCode';
	$scope.collectionName = "test_source";
	$scope.flag = false;
	$scope.flag2 = 'A';
	$scope.prevchoice = 'informationCode'

	var url = "http://10.146.95.172:3010/api/metadatalevel";
	$scope.setChoice = function(choice){
		$scope.selectedOption = choice;
		if(choice == 'informationCode')
			$scope.flag = true;
		else if(choice == 'fieldName')
			$scope.flag = false;
	};
	
	$scope.submitList = function(){
			//$http.post(){}
		if(($scope.selectedList.length === 0 || $scope.prevchoice === 'fieldName') && $scope.selectedOption === 'informationCode'){
			$scope.availableOptions = [];
			$scope.selectedList = [];
			$scope.selectedList2 = [];
			$scope.prevchoice = 'informationCode';

			$scope.availableItems = [];
			
			var data = {
				"collectionName": $scope.collectionName,
				"choice": $scope.selectedOption,
				"informationCode": "NULL",
				"fieldName" : "NULL"
			};
			var responsePromise = $http.post(url,data);
			responsePromise.then(function(response) {
					$scope.leftListObtained = true;
                    var availabledata = response.data.item;	
					//console.log(availabledata);
					for(var i=0;i<availabledata.length;i++){
						$scope.availableOptions.push({ value : availabledata[i].name, isAttempted : false, count : availabledata[i].count  });
					}
                });
				
			$scope.leftListObtained = true;
			//console.log($scope.availableOptions);    
		} else if (($scope.selectedList.length === 0 || $scope.prevchoice === 'informationCode') && $scope.selectedOption === 'fieldName'){
			$scope.availableOptions = [];
			$scope.selectedList = [];
			$scope.selectedList2 = [];
			$scope.prevchoice = 'fieldName';


			$scope.availableItems = [];

			var data = {
				"collectionName": $scope.collectionName,
				"choice": $scope.selectedOption,
				"informationCode": "NULL",
				"fieldName" : "NULL"
			};
			var responsePromise = $http.post(url,data);
			responsePromise.then(function(response) {
					$scope.leftListObtained = true;
                    var availabledata = response.data.item;	
					//console.log(availabledata);
					for(var i=0;i<availabledata.length;i++){
						$scope.availableOptions.push({ value : availabledata[i].name, isAttempted : false, count : availabledata[i].count  });
					}
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
				
				//console.log(fieldNameValue);
				
			var data = {
				"collectionName": $scope.collectionName,
				"choice": $scope.selectedOption,
				"informationCode": "NULL",
				"pageToken" : 1,
				"fieldName" : fieldNameValue
			};
			var responsePromise = $http.post(url,data);
			responsePromise.then(function(response) {
                     $scope.availableItems = response.data.items;	
					 //console.log($scope.availableItems);
                });
            
				$scope.leftListObtained = true;
				$scope.selectedList2=[];
				
		} else if($scope.selectedList.length > 0 && $scope.selectedOption === 'informationCode'){
				console.log($scope.selectedList);
				
				$scope.availableItems = [];
				$scope.rightListObtained = true;
				
				var infoCodeResult = $scope.selectedList.map(function(item) {
					return '"' + item + '"';
				});
				
				var infoCodeValue = infoCodeResult.join(', ');
				
				//console.log(infoCodeValue);
				
			var data = {
				"collectionName": $scope.collectionName,
				"choice": $scope.selectedOption,
				"informationCode": infoCodeValue ,
				"pageToken" : 1,
				"fieldName" : "NULL"
			};
			var responsePromise = $http.post(url,data);
			responsePromise.then(function(response) {
                     $scope.availableItems = response.data.items;	
					 //console.log($scope.availableItems);
                });
            
				$scope.leftListObtained = true;
				$scope.selectedList2=[];
			}
	};
	

	$scope.optionAttempted= function(item){
		if(item.isAttempted === true){
			item.isAttempted = false;
			var index = $scope.selectedList.indexOf(item.value);
			if (index > -1) {
				$scope.selectedList.splice(index, 1);
				$scope.selectedList2.splice(index,1);

			}
		}
		else{
			item.isAttempted = true;
			$scope.selectedList.push(item.value);
			$scope.selectedList2.push(1);

		}
	};
	
	$scope.generateCSV = function(){
		
	};


});
