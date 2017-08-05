var logApp = angular.module('logAnalysisApp', ['ngMaterial','lfNgMdFileInput','ngRoute','ngMessages','ngSanitize', 'ngCsv']);
// angular.module('logAnalysisApp', ['ngMaterial','ngRoute','lfNgMdFileInput'])
logApp.constant('config', {
	apiUrl:'http://10.17.14.26:8080',
	// serverUrl:'http://10.17.14.26:3000'
	serverUrl:'http://localhost:3000'
})

logApp.config(['$routeProvider', '$compileProvider','$mdThemingProvider', function($routeProvider,$compileProvider,$mdThemingProvider){
    $compileProvider.debugInfoEnabled(false);
    // $mdThemingProvider.theme('default')
	$routeProvider
	.when('/login',	{
		templateUrl: 'views/login.html',
		controller: 'loginControl'
	})
	.when('/register', {
		templateUrl: 'views/register.html',
		controller: 'registerControl'
	})
	.when('/home', {
		templateUrl: 'views/filemenu.html',
		controller: 'fileUploadCtrl'
	})
	.when('/admin',	{
		templateUrl: 'views/adminpanel.html',
		controller: 'adminCtrl'
	})
	.when('/upload', {
		templateUrl: 'views/upload.html',
		controller: 'uploadCtrl'
	})
	.when('/reportshome', {
		templateUrl: 'views/reports.html',
		// controller: 'reportsMenuCtrl'
	})
	.when('/totalreport', {
		templateUrl: 'views/total.html',
		controller: 'totalCtrl'
	})
	.when('/itemreport', {
		templateUrl: 'views/item.html',
		controller: 'itemCtrl'
	})
	.when('/metadatareport', {
		templateUrl: 'views/metadata.html',
		controller: 'metadataCtrl'
	})
	.when('/sourcereport', {
		templateUrl: 'views/source.html',
		controller: 'sourceCtrl'
	})
	.otherwise({
		redirectTo: '/login'
	});
}])

logApp.service('userInfoService', function(){
	
	var userData = {}
	var collectionName = ""

	this.setUserRole = function(role){
		// console.log(role)
		userData.role = role
		// console.log(userData.role)
	}
	this.getUserRole = function(){
		// console.log("def")
		return userData.role
	}
	this.setUserInfo = function(data){
		userData = data
	}
	this.getUserInfo = function(){
		return userData
	}
	this.removeUserInfo = function(){
		userData = {}
	}
	this.setCollection = function(name){
		collectionName = name
	}
	this.getCollection = function(){
		return collectionName
	}
})



