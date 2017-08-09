logApp.controller('itemCtrl', function($rootScope, $scope, $timeout, $location, $http, config, userInfoService) {
    $scope.availableOptions = [];
    $scope.leftListObtained = false;
    $scope.selectedList = [];
    $scope.selectedList2 = [];
    $scope.rightListObtained = false;
    $scope.availableItems = [];
    $scope.availableInfoCode = [];
    $scope.selectedOption = 'informationCode';
    $scope.collectionName = userInfoService.getCollection()
    $scope.username = userInfoService.getUserName()
    $scope.flag = 0;
    $scope.showSpinner = false
    $scope.showBar = false

    console.log($scope.collectionName)
    // var url = "http://10.146.95.172:3000/api/itemlevel";
    var url = config.serverUrl + "/api/itemlevel"
    $scope.setChoice = function(choice) {
        $scope.selectedOption = choice;
        $scope.availableItems = []
        $scope.availableOptions = []
        if (choice === 'informationCode')
            $scope.flag = 1;
        else if (choice === 'fieldName')
            $scope.flag = 2;
        else if (choice === 'fieldValue')
            $scope.flag = 3;
    };

    $scope.logout = function(){
        userInfoService.removeUserInfo()
        $location.url("/login");
        return
    }

    $scope.getArray = []
    $scope.getHeader = function() {
        if ($scope.flag === 1)
            return ["Field Name"]
        else if ($scope.flag === 2)
            return ["Handle Id", "Field Values", "Count"]
        else
            return ["Handle Id", "Field Names", "Count"]
    }

    $scope.submitList = function() {
        //$http.post(){}
        $scope.getArray = []
        if (($scope.selectedList.length === 0 || $scope.prevchoice === 'fieldName') && $scope.selectedOption === 'informationCode') {
            //		if($scope.selectedList.length === 0 && $scope.selectedOption === 'informationCode'){
            $scope.showSpinner = true
            $scope.availableOptions = [];
            $scope.selectedList = [];
            $scope.availableItems = [];

            var data = {
                "collectionName": $scope.collectionName,
                "choice": $scope.selectedOption,
                "informationCode": "NULL",
                "fieldName": "NULL",
                "fieldValue": "NULL"
            };
            var responsePromise = $http.post(url, data);
            responsePromise.success(function(data, status, headers, config) {
                $scope.leftListObtained = true;
                var availabledata = data.item;
                for (var i = 0; i < availabledata.length; i++) {
                    $scope.availableOptions.push({ value: availabledata[i].name, isAttempted: false, count: availabledata[i].count });
                }
                $scope.showSpinner = false
            });

            responsePromise.error(function(data, status, headers, config) {
                alert("AJAX failed!");
            });
        } else if (($scope.selectedList.length === 0 || $scope.prevchoice === 'informationCode') && $scope.selectedOption === 'fieldName') {
            //		} else if ($scope.selectedList.length === 0 && $scope.selectedOption === 'fieldName'){
            $scope.showSpinner = true
            $scope.availableOptions = [];
            $scope.selectedList = [];
            $scope.availableItems = [];

            var data = {
                "collectionName": $scope.collectionName,
                "choice": $scope.selectedOption,
                "informationCode": "NULL",
                "fieldName": "NULL",
                "fieldValue": "NULL"
            };
            var responsePromise = $http.post(url, data);
            responsePromise.success(function(data, status, headers) {
                var availabledata = data.item;
                for (var i = 0; i < availabledata.length; i++) {
                    $scope.availableOptions.push({ value: availabledata[i].name, isAttempted: false, count: availabledata[i].count });
                }
                $scope.showSpinner = false
            });
            responsePromise.error(function(data, status, headers) {
                alert("AJAX failed!");
            });
            $scope.leftListObtained = true;

        } else if (($scope.selectedList.length === 0 || $scope.prevchoice === 'fieldName') && $scope.selectedOption === 'fieldValue') {
            //		} else if ($scope.selectedList.length === 0 && $scope.selectedOption === 'fieldName'){
            $scope.showSpinner = true
            $scope.availableOptions = [];
            $scope.selectedList = [];
            $scope.availableItems = [];

            var data = {
                "collectionName": $scope.collectionName,
                "choice": $scope.selectedOption,
                "informationCode": "NULL",
                "fieldName": "NULL",
                "fieldValue": "NULL"
            };
            var responsePromise = $http.post(url, data);
            responsePromise.success(function(data, status, headers) {
                var availabledata = data.item;
                for (var i = 0; i < availabledata.length; i++) {
                    $scope.availableOptions.push({ value: availabledata[i].name, isAttempted: false, count: availabledata[i].count });
                }
                $scope.showSpinner = false
            });
            responsePromise.error(function(data, status, headers) {
                alert("AJAX failed!");
            });
            $scope.leftListObtained = true;

        } else if ($scope.selectedList.length > 0 && $scope.selectedOption === 'fieldName') {

            console.log($scope.selectedList);
            $scope.showBar = true
            $scope.availableItems = [];
            $scope.rightListObtained = true;


            var fieldResult = $scope.selectedList.map(function(item) {
                return '"' + item + '"';
            });
            var fieldNameValue = fieldResult.join(', ');

            console.log(fieldNameValue);

            var data = {
                "collectionName": $scope.collectionName,
                "choice": $scope.selectedOption,
                "informationCode": "NULL",
                "pageToken": 1,
                "fieldName": fieldNameValue,
                "fieldValue": "NULL"
            };
            var responsePromise = $http.post(url, data);
            responsePromise.success(function(data, status, headers) {
                $scope.availableInfoCode = data.infoCode;
                $scope.availableItems = data.item;                
                for (var i in $scope.availableItems) {
                    console.log($scope.availableItems[i])
                    var fieldValues = ""
                    for (var j in $scope.availableItems[i].fieldvalue)
                        fieldValues += $scope.availableItems[i].fieldvalue[j] + " | "
                    fieldValues = fieldValues.substring(0, fieldValues.length - 3);
                    $scope.getArray.push({
                        'handleId': $scope.availableItems[i].handleId,
                        'fieldvalues': fieldValues,
                        'count': $scope.availableItems[i].fieldvalue.length
                    })
                }
                $scope.showBar = false
                // console.log($scope.availableItems);
                // console.log($scope.availableInfoCode);
            });
            responsePromise.error(function(data, status, headers) {
                alert("AJAX failed!");
            });
            $scope.leftListObtained = true;
            $scope.selectedList = [];

        } else if ($scope.selectedList.length > 0 && $scope.selectedOption === 'fieldValue') {

            console.log($scope.selectedList);
            $scope.showBar = true
            $scope.availableItems = [];
            $scope.rightListObtained = true;


            var fieldResult = $scope.selectedList.map(function(item) {
                return '"' + item + '"';
            });
            var fieldNameValue = fieldResult.join(', ');

            console.log(fieldNameValue);

            var data = {
                "collectionName": $scope.collectionName,
                "choice": $scope.selectedOption,
                "informationCode": "NULL",
                "pageToken": 1,
                "fieldValue": fieldNameValue,
                "fieldName": "NULL"
            };
            var responsePromise = $http.post(url, data);
            responsePromise.success(function(data, status, headers) {
                $scope.availableInfoCode = data.infoCode;
                $scope.availableItems = data.item;                
                for (var i in $scope.availableItems) {
                    console.log($scope.availableItems[i])
                    var fieldNames = ""
                    for (var j in $scope.availableItems[i].fieldname)
                        fieldNames += $scope.availableItems[i].fieldname[j] + " | "
                    fieldNames = fieldNames.substring(0, fieldNames.length - 3);
                    $scope.getArray.push({
                        'handleId': $scope.availableItems[i].handleId,
                        'fieldnames': fieldNames,
                        'count': $scope.availableItems[i].fieldname.length
                    })
                }
                $scope.showBar = false
                console.log($scope.availableItems);
                console.log($scope.availableInfoCode);
            });
            responsePromise.error(function(data, status, headers) {
                alert("AJAX failed!");
            });
            $scope.leftListObtained = true;
            $scope.selectedList = [];

        } else if ($scope.selectedList.length > 0 && $scope.selectedOption === 'informationCode') {
            console.log($scope.selectedList);
            $scope.showBar = true
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
                "informationCode": infoCodeValue,
                "pageToken": 1,
                "fieldName": "NULL",
                "fieldValue": "NULL"
            };
            var responsePromise = $http.post(url, data);
            responsePromise.success(function(data, status, headers) {
                $scope.availableItems = data.item;
                for (var i in $scope.availableItems) {
                    console.log($scope.availableItems[i])
                    $scope.getArray.push({
                        'fieldName': $scope.availableItems[i]
                    })
                }
                $scope.showBar = false
                // console.log($scope.availableItems);
            });
            responsePromise.error(function(data, status, headers) {
                alert("AJAX failed!");
            });
            $scope.leftListObtained = true;
            $scope.selectedList = [];
        }
    };


    $scope.optionAttempted = function(item) {
        //		$scope.selectedList.push(item.value);
        if (item.isAttempted === true) {
            item.isAttempted = false;
            var index = $scope.selectedList.indexOf(item.value);
            if (index > -1) {
                $scope.selectedList.splice(index, 1);
                $scope.selectedList2.splice(index, 1);

            }
        } else {
            item.isAttempted = true;
            $scope.selectedList.push(item.value);
            $scope.selectedList2.push(1);

        }
    };

    $scope.generateCSV = function() {

    };


});