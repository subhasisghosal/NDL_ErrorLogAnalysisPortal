logApp.controller('registerControl', function($scope, $timeout, $location, $http) {
    
    $scope.user = {
    	firstName:"",
    	lastName:"",
    	userId:"",
    	password:""
    }
    var url = "http://localhost:3000/users/register";
    $scope.goToLoginForm = function(){
        $location.url("login");
    };
    $scope.registerUser = function(){
    	console.log($scope.user);
    	var responsePromise = $http.post(url,$scope.user);
    	responsePromise.then(function(response) {
    		console.log(response);
    		$scope.goToLoginForm();
    	});
    }
});