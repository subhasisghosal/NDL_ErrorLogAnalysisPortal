logApp.controller('loginControl', function($rootScope, $scope, $timeout, $location, $http) {
    // ndl.LoginPage.init($scope);
    $scope.user = {
        userId:"",
        password:""
    }
    var url = "http://localhost:3000/users/authenticate";
    $scope.goToRegisterForm = function(){
        $location.url("register");
    };
    $scope.loginUser = function(){
        // console.log($scope.user);
        var responsePromise = $http.post(url,$scope.user);
        // console.log(responsePromise)
        responsePromise.then(function(response) {
            // console.log(response.data);
            if(response.data.loginStatus){
                $rootScope.data = response.data;
                $location.url("home");
            }
            else{
                $scope.user = {
                    userId:"",
                    password:""
                }
            }
        });
    }
});

