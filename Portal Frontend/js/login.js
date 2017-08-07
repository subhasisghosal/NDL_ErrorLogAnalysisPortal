logApp.controller('loginControl', function($rootScope, $scope, $timeout, $location, $http, config, userInfoService) {
    // ndl.LoginPage.init($scope);
    $scope.user = {
        userId:"",
        password:""
    }
    var url = config.serverUrl + "/users/authenticate";
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
                // $rootScope.data = response.data;
                userInfoService.setUserInfo(response.data)
                // console.log($rootScope.data)
                $http.post(config.serverUrl + "/users/getRole",{'userId':response.data.userid})
                .then(function(response){
                    var role = response.data.role
                    var name = response.data.firstName + " " + response.data.lastName
                    userInfoService.setUserName(name)
                    if(role)
                        userInfoService.setUserRole(role)
                    if(role === "admin")
                        $location.url("admin")
                    else{

                        $location.url("home")
                    }
                })
                // $location.url("home");
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

