// var logApp = angular.module('logAnalysisApp', ['ngMaterial','lfNgMdFileInput','ngRoute']);
logApp.controller('fileUploadCtrl', function($rootScope, $scope, $timeout, $location, $http, config, userInfoService, $mdDialog) {

    // $scope.userData = $rootScope.data;
    console.log("User is " + JSON.stringify(userInfoService.getUserInfo()));    
    // $scope.sourceList = [];


    $scope.userData = userInfoService.getUserInfo();
    $scope.username = userInfoService.getUserName()
    $scope.role = userInfoService.getUserRole()
    $scope.sourceList = []
    $scope.selectedBatches = []

    if (!$scope.userData.userid && $scope.role==="admin"){
        $location.url("/login");
        return
    }
    
    $scope.logout = function(){
        userInfoService.removeUserInfo()
        $location.url("/login");
        return
    }

   var sourceList = []
   // console.log(userData.uploads)
   for (index in $scope.userData.uploads) {
            // console.log(response.data[index]);
        sourceList.push($scope.userData.uploads[index].sourceCode);
    }
    console.log(sourceList)
    if (sourceList.length > 0)
            $scope.sourceList = sourceList;
    

    var role = userInfoService.getUserRole()
    $scope.isDisabled = false;
    $scope.noCache = true;
    $scope.selectedItem = "";
    $scope.searchText = "";
    $scope.sourceInfo = []
    $scope.showTabs = (role.toUpperCase() === "CS")

    $scope.getBatches = function(source){
        for(var i in $scope.userData.uploads){
            if($scope.userData.uploads[i].sourceCode === source)
                $scope.selectedBatches.push($scope.userData.uploads[i].batch)
        }
    }

    $scope.getComments = function(source, batch){
        for(var i in $scope.userData.uploads){
            if($scope.userData.uploads[i].sourceCode === source && $scope.userData.uploads[i].batch === batch){
                $scope.comments = $scope.userData.uploads[i].comments
                $scope.selectedFile = $scope.userData.uploads[i]
            }
        }
    }

    $scope.showLogReports = function(){
        userInfoService.setCollection($scope.selectedFile.collectionName)
        $location.url("reportshome")
    }

    $scope.getSources = function() {
        $scope.assItems = []
        $http.get(config.serverUrl + "/admin/getsources")
            .then(function(response) {
                $scope.sourceInfo = response.data
                //console.log($scope.sourceInfo)
            })
    }

    $scope.deleteLog = function(){
        console.log($scope.file)
        $http.post(config.serverUrl + "/api/deleteLog", $scope.file)
            .then(function(response){
                console.log(response)
                $mdDialog.show(
                  $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Deleted Log')
                    .textContent('Log Entry Deleted Successfully')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Got it!')
                    .targetEvent(ev)
                )
            })
    }

    $scope.querySearch = function(text) {
        var data = {
            session: $scope.userData,
            item: text
        };
        var responsePromise = $http.post("http://localhost:3000/api/getCollections", data);
        var sourceList = [];
        responsePromise.then(function(response) {
            console.log(response.data)

            for (index in response.data) {
                // console.log(response.data[index]);
                sourceList.push(response.data[index]);
            }
            // return $scope.sourceList

        });
        return sourceList;
    };

    $scope.searchTextChange = function(text) {
        console.log('Text changed to ' + text);
    };

    $scope.selectedItemChange = function(item) {
        console.log('Item changed to ' + JSON.stringify(item));
        // $log.info('Item changed to ' + JSON.stringify(item));
        // $scope.ctrl.selectedItem = item
    };

    $scope.newSource = function(name) {
        alert("Sorry! You'll need to create a Constitution for " + name + " first!");
    };



    $scope.file = {
        source: "",
        batch: 0,
        comment: ""
    };

    // $scope.item = {display:"abc"}

    $scope.onFileClick = function(obj, idx) {
        console.log(obj);
        console.log("Selected File");
    };

    $scope.uploadFile = function() {
        // $scope.$apply(function(scope) {
        //     console.log('files:', element.files);
        //     // Turn the FileList object into an Array
        //     $scope.files = []
        //     for (var i = 0; i < element.files.length; i++) {
        //         $scope.files.push(element.files[i])
        //     }
        //     $scope.progressVisible = false
        // });
        var file = $scope.myFile;
        var uploadUrl = "/testRef";
        var fd = new FormData();
        fd.append('file', file);

        $http.post(config.serverUrl + uploadUrl,fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(){
          console.log("success!!");
        })
        .error(function(){
          console.log("error!!");
        });
    };
    // $scope.onFileSelect = function($files) {
    //     console.log($files);
    // }

    /*$scope.onSubmitClick = function() {
        var file = $scope.myFile;

        console.log('file is ' + $scope.myFile);

        // var uploadUrl = "/fileUpload";
        // fileUpload.uploadFileToUrl(file, uploadUrl);
    };*/

    $scope.onSubmitClick = function($files) {

        for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
        }
        /*$scope.file.userId = $scope.userData.userid
        var formData = new FormData()
        formData.append('file', $scope.files[0].lfFile);
        formData.append('abc', 'def')
        for (var key of formData.entries()) {
            console.log(key[0] + ', ' + key[1]);
        }

        //console.log(formData)
        // console.log($scope.selectedItem);
        // console.log($scope.userData.userid);
        // scope.$apply(function(scope) {
        //   console.log('files:', files);
        //   // Turn the FileList object into an Array
        //     scope.files = []
        //     for (var i = 0; i < element.files.length; i++) {
        //       scope.files.push(element.files[i])
        //     }
        //   scope.progressVisible = false
        //   });
        // };
        var responsePromise = $http.post(config.serverUrl + "/testRef", formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        });
        responsePromise.then(function(response) {
            console.log(response)
        })
        // var fd = new FormData()
        // for (var i in files) {
        //     fd.append("uploadedFile", files[i])
        // }
        // fd.append("userId", $scope.userData.userid)
        // fd.append("source", "IEEE")
        // fd.append("batch", $scope.file.batch)
        // fd.append("comments", $scope.file.comment)
        // var xhr = new XMLHttpRequest()
        // xhr.upload.addEventListener("progress", $scope.uploadProgress, false)
        // xhr.addEventListener("load", uploadComplete, false)
        // xhr.addEventListener("error", uploadFailed, false)
        // xhr.addEventListener("abort", uploadCanceled, false)
        // xhr.open("POST", "http://localhost:3000/api/file")
        // $scope.progressVisible = true
        // xhr.send(fd)
    }

    $scope.onSubmitFilesChange = function() {
        console.log($scope.submitButtonFiles);
        console.log("Changed File");
    }

    $scope.uploadProgress = function(evt) {
        $scope.$apply(function(){
            if (evt.lengthComputable) {
                $scope.progress = Math.round(evt.loaded * 100 / evt.total)
            } else {
                $scope.progress = 'unable to compute'
            }
        })*/
    }

    function uploadComplete(evt) {
        /* This event is raised when the server send back a response */
        alert(evt.target.responseText)
    }

    function uploadFailed(evt) {
        alert("There was an error attempting to upload the file.")
    }

    function uploadCanceled(evt) {
        $scope.$apply(function() {
            $scope.progressVisible = false
        })
        alert("The upload has been canceled by the user or the browser dropped the connection.")
    }

    $scope.onFileRemove = function(obj, idx) {
        console.log(obj);
        console.log("Removed File");
    };
});