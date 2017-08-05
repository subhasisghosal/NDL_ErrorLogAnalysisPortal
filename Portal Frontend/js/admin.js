logApp.controller('adminCtrl', function($rootScope, $scope, $timeout, $location, $http, config) {

    $scope.assignments = [{}]
    $scope.users = [{}]
    $scope.sources = [{}]
    $scope.userInfo = []
    $scope.sourceInfo = []
    $scope.ifActive = { isActive: false }
    $scope.items = []
    $scope.chips = []
    $scope.backupChip = []
    $scope.removal = {}
    $scope.editFlag = []
    $scope.editUserFlag = []

    $scope.onChange = function(cbState) {
        $scope.ifActive.isActive = cbState.isActive;
        if (cbState.isActive) {
            console.log("Activated")
        } else {
            console.log("DeActivated")
        }
        //console.log(cbState)
        var data = {
            user: cbState.userId,
            source: cbState.source,
            status: cbState.isActive
        }
        console.log(data)
        var responsePromise = $http.post(config.serverUrl + "/admin/updateStatus", data);
        responsePromise.then(function(response) {
            console.log(response)
        })
    }

    $scope.addSource = function() {
        $scope.sources.push({});
    }

    $scope.addUser = function() {
        $scope.users.push({});
    }

    $scope.addAssignments = function() {
        $scope.assignments.push({});
    }

    $scope.getSources = function() {
        $scope.assItems = []
        $http.get(config.serverUrl + "/admin/getsources")
            .then(function(response) {
                $scope.sourceInfo = response.data
                $scope.assItems = response.data
                //console.log($scope.sourceInfo)
            })
    }

    $scope.createSource = function() {
        var data = { source: JSON.stringify($scope.sources) }
        console.log(data)
        var responsePromise = $http.post(config.serverUrl + "/admin/addsource", data);
        responsePromise.then(function(response) {
            console.log(response)
            $scope.sources = [{}]
            $scope.$apply()
        })
    }

    $scope.getUsers = function() {
        $scope.assItems = []
        $http.get(config.serverUrl + "/admin/getusers")
            .then(function(response) {
                $scope.userInfo = response.data
                $scope.assItems = response.data
                //console.log($scope.userInfo)
            })
    }

    $scope.registerUser = function() {
        // console.log(JSON.stringify($scope.users))
        var data = { data: JSON.stringify($scope.users) }
        console.log(data)
        var responsePromise = $http.post(config.serverUrl + "/admin/adduser", data);
        responsePromise.then(function(response) {
            console.log(response)
            $scope.users = [{}]
            $scope.$apply()
        })
    }

    $scope.assignTask = function() {
        console.log(JSON.stringify($scope.assignments))
        var data = { data: JSON.stringify($scope.assignments) }
        // console.log(data)
        var responsePromise = $http.post(config.serverUrl + "/admin/assigntask", data);
        responsePromise.then(function(response) {
            console.log(response)
            // $scope.assignments = [{}]
            // $scope.$apply()
        })
    }

    $scope.populateField = function(choice) {
        $scope.assignment = [] // to clear the first dropdown when select type is changed
        $scope.items = []
        $scope.chips = []
        $scope.backupChip = []

        $scope.removal = {}
        $scope.ifActive = {
            isActive: false
        }
        if (choice == "user") {
            $scope.getUsers()
        } else if (choice == "source") {
            $scope.getSources()
        }
    }

    $scope.getAssignments = function(choice, id) {

        $scope.chips = []
        $scope.backupChip = []
        $scope.items = []

        if (choice === 'user') {
            $scope.ifActive.userId = id
            $scope.removal.userId = id
            var data = { data: choice, id: id }
        } else {
            $scope.removal.source = id
            $scope.ifActive.source = id
            var data = { data: choice, id: id }
        }

        var responsePromise = $http.post(config.serverUrl + "/admin/getAssignment", data);
        responsePromise.then(function(response) {

            var sourceCodes = response.data.sourceCodes || undefined
            var userIds = response.data.userIds || undefined

            if (sourceCodes && sourceCodes.length > 0) {

                $scope.items = sourceCodes;

                for (var index in sourceCodes) {
                    $scope.chips.push(sourceCodes[index].code)
                    $scope.backupChip.push(sourceCodes[index].code)
                }
            } else if (userIds && userIds.length > 0) {

                $scope.items = userIds;

                for (var index in userIds) {
                    $scope.chips.push(userIds[index].uId)
                    $scope.backupChip.push(userIds[index].uId)
                }
            }

        })
    }

    $scope.showActiveness = function(item) {
        //console.log(item.isActive)
        if (item.code) {
            $scope.ifActive.source = item.code
        } else {
            $scope.ifActive.userId = item.uId
        }
        $scope.ifActive.isActive = item.isActive
    }

    $scope.removeChip = function(index) {
        if ($scope.removal.userId) {
            $scope.removal.source = $scope.backupChip[index]
            $scope.removal.removeSource = true;

        } else {
            $scope.removal.userId = $scope.backupChip[index]
            $scope.removal.removeId = true;

        }

        var responsePromise = $http.post(config.serverUrl + "/admin/deleteAssignment", $scope.removal);
        responsePromise.then(function(response) {
            $scope.backupChip.splice(index, 1)
            if ($scope.removal.removeId)
                delete $scope.removal.userId
            if ($scope.removal.removeId)
                delete $scope.removal.source
        })
    }

    $scope.editUser = function(index){
        console.log("Selected User for Edit: "+JSON.stringify($scope.userInfo[index]))
        $scope.editUserFlag[index] = true
    }

    $scope.saveUser = function(index){
        console.log("Saved User for Edit: "+JSON.stringify($scope.userInfo[index]))
        $http.post(config.serverUrl + "/admin/editUser", $scope.userInfo[index])
        .then(function(response) {
            console.log(response)
            $scope.editUserFlag[index] = false
        })
    }

    $scope.deleteUser = function(index){
        console.log("Selected User for Delete is: "+JSON.stringify($scope.userInfo[index]))
        var responsePromise = $http.post(config.serverUrl + "/admin/deleteUser", {'userId':$scope.userInfo[index].userId})
        responsePromise.then(function(response) {
            delete $scope.userInfo[index]
            console.log(response)
        })
    }

    $scope.editSource = function(index){
        console.log("Selected Source for Edit: "+JSON.stringify($scope.sourceInfo[index]))
        $scope.editFlag[index] = true
    }

    $scope.saveSource = function(index){
        console.log("Saved Source for Edit: "+JSON.stringify($scope.sourceInfo[index]))
        $http.post(config.serverUrl + "/admin/editSource", $scope.sourceInfo[index])
        .then(function(response) {
            console.log(response)
            $scope.editFlag[index] = false
        })
    }

    $scope.deleteSource = function(index){
        console.log("Selected Source for Delete is: "+JSON.stringify($scope.sourceInfo[index]))
        var responsePromise = $http.post(config.serverUrl + "/admin/deleteSource", {'sourceCode':$scope.sourceInfo[index].sourceCode})
        responsePromise.then(function(response) {
            delete $scope.sourceInfo[index]
            console.log(response)
        })
    }
});