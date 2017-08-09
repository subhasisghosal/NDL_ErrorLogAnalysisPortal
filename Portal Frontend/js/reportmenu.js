logApp.controller('reportsMenuCtrl', function($rootScope, $scope, $timeout, $location, $http, config, userInfoService, $mdDialog) {
    console.log("User is " + JSON.stringify(userInfoService.getUserInfo()));

    $scope.username = userInfoService.getUserName()

    if (!$scope.username){
        $location.url("/login");
        return
    }
    
    $scope.logout = function(){
        userInfoService.removeUserInfo()
        $location.url("/login");
        return
    }

    $scope.route = function(choice){
    	if(choice===1){
    		$location.url("totalreport");
        	return
    	}
    	else if(choice===2){
    		$location.url("itemreport");
        	return
    	}
    	else if(choice===3){
    		$location.url("metadatareport");
        	return
    	}
    	else{
    		$location.url("sourcereport");
        	return
    	}
    }
})