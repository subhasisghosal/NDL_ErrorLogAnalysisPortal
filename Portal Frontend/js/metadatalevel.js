logApp.controller('metadataCtrl', function($rootScope, $scope, $timeout, $location, $http, config, userInfoService) {
	$scope.availableOptions = [];
	$scope.leftListObtained = false;
	$scope.selectedList = [];
	$scope.selectedList2 = [];
	$scope.rightListObtained = false;
	$scope.availableItems = [];
	$scope.selectedOption = 'informationCode';
	$scope.collectionName = userInfoService.getCollection()
	$scope.username = userInfoService.getUserName()
	$scope.flag = false;
	$scope.flag2 = 'A';
	$scope.prevchoice = 'informationCode'
	$scope.showSpinner = false
    $scope.showBar = false

	// var url = "http://10.146.95.172:3000/api/metadatalevel";
	var url = config.serverUrl + "/api/metadatalevel"
	$scope.setChoice = function(choice){
		$scope.selectedOption = choice;
		$scope.availableItems = []
		$scope.availableOptions = []
		if(choice == 'informationCode')
			$scope.flag = true;
		else if(choice == 'fieldName')
			$scope.flag = false;
	};

	$scope.logout = function(){
        userInfoService.removeUserInfo()
        $location.url("/login");
        return
    }
	
	$scope.getArray = []
	$scope.getHeader = function () {
		if ($scope.flag)
			return ["Field Name", "Field Value", "Handle ID"]
		else
			return ["Information Code", "Field Value", "Handle ID"]
	}

	$scope.submitList = function(){
			//$http.post(){}
		$scope.getArray = []
		if(($scope.selectedList.length === 0 || $scope.prevchoice === 'fieldName') && $scope.selectedOption === 'informationCode'){
			$scope.showSpinner = true
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
					$scope.showSpinner = false
                });
				
			$scope.leftListObtained = true;
			//console.log($scope.availableOptions);    
		} else if (($scope.selectedList.length === 0 || $scope.prevchoice === 'informationCode') && $scope.selectedOption === 'fieldName'){
			$scope.showSpinner = true
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
					$scope.showSpinner = false
                });
            
				$scope.leftListObtained = true;
				
		} else if ($scope.selectedList.length > 0 && $scope.selectedOption === 'fieldName'){
				$scope.showBar = true
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
                     // $scope.getArray = response.data.items;
                     for (var i in $scope.availableItems) {
                     	console.log($scope.availableItems[i])
                     	$scope.getArray.push({
                     		'informationCode': $scope.availableItems[i].informationCode,
                     		'fieldValue': $scope.availableItems[i].fieldvalue,
                     		'handle': $scope.availableItems[i].handleId
                     	})
                     }
                     $scope.showBar = false
                });
            
				$scope.leftListObtained = true;
				$scope.selectedList2=[];
				
		} else if($scope.selectedList.length > 0 && $scope.selectedOption === 'informationCode'){
				$scope.showBar = true
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
                     // $scope.getArray = response.data.items;
                     for (var i in $scope.availableItems) {
                     	console.log($scope.availableItems[i])
                     	$scope.getArray.push({
                     		'fieldName': $scope.availableItems[i].fieldName,
                     		'fieldValue': $scope.availableItems[i].fieldvalue,
                     		'handle': $scope.availableItems[i].handleId
                     	})
                     }
					 // console.log($scope.getArray);
					 $scope.showBar = false
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
