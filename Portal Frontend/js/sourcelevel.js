logApp.controller('sourceCtrl', function($rootScope, $scope, $timeout, $location, $http, config, userInfoService) {
	$scope.availableOptions = [];
	$scope.leftListObtained = false;
	$scope.selectedList = [];
	$scope.rightListObtained = false;
	$scope.prevchoice = 'informationCode';
	$scope.availableItems = [];
	$scope.selectedOption = 'informationCode';
	$scope.collectionName = userInfoService.getCollection()
	$scope.username = userInfoService.getUserName()
	$scope.flag = false;
	$scope.showSpinner = false
    $scope.showBar = false
	
	// var url = "http://10.146.95.172:3000/api/sourcelevel";
	var url = config.serverUrl + "/api/sourcelevel"
	$scope.setChoice = function(choice){
		$scope.availableItems = []
		$scope.availableOptions = []
		$scope.selectedOption = choice;
		if(choice === 'informationCode')
			$scope.flag = true;
		else if(choice === 'handle')
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
			return ["Count", "Handle IDs", "Information Code"]
		else
			return ["Information Code"]
	}

	$scope.submitList = function(){
			//$http.post(){}
		$scope.getArray = []
		if(($scope.selectedList.length === 0 || $scope.prevchoice === 'handle') && $scope.selectedOption === 'informationCode'){
			$scope.showSpinner = true
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
					$scope.showSpinner = false
                });
				
		} else if (($scope.selectedList.length === 0 || $scope.prevchoice === 'informationCode') && $scope.selectedOption === 'handle'){
			$scope.showSpinner = true
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
					$scope.showSpinner = false
                });
           
				$scope.leftListObtained = true;
				
		} else if ($scope.selectedList.length > 0 && $scope.selectedOption === 'handle'){
				$scope.showBar = true
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
					 // console.log($scope.availableItems);
					 // $scope.getArray = $scope.availableItems
					 for (var i in $scope.availableItems) {
                     	console.log($scope.availableItems[i])
                     	$scope.getArray.push({
                     		'informationCode': $scope.availableItems[i]
                     	})
                     }
                     $scope.showBar = false
                });
            
				$scope.leftListObtained = true;
				//$scope.selectedList=[];
				
		} else if($scope.selectedList.length > 0 && $scope.selectedOption === 'informationCode'){
				$scope.showBar = true
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
//                     $scope.availableItems = response.data.handles;
					console.dir(response.data.items);
					$scope.availableItems = response.data.items;
					for (var i in $scope.availableItems) {
                     	console.log($scope.availableItems[i])
                     	var handles=""
                     	for(var j in $scope.availableItems[i].handleId)
                     		handles += $scope.availableItems[i].handleId[j] + " | "
                     	handles = handles.substring(0, handles.length - 3);
                     	$scope.getArray.push({
                     		'count': $scope.availableItems[i].handleId.length,
                     		'handleIDs': handles,
                     		'informationCode': $scope.availableItems[i].informationCode
                     	})
                     }
                     $scope.showBar = false
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
