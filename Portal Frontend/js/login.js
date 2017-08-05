logApp.controller('loginControl', function($rootScope, $scope, $timeout, $location, $http, config, userInfoService) {
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
                // $rootScope.data = response.data;
                userInfoService.setUserInfo(response.data)
                // console.log($rootScope.data)
                $http.post("http://localhost:3000/users/getRole",{'userId':response.data.userid})
                .then(function(response){
                    var role = response.data.role
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

