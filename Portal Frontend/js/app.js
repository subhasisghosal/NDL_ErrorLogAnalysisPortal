var logApp = angular.module('logAnalysisApp', ['ngMaterial','lfNgMdFileInput','ngRoute','ngMessages']);
// angular.module('logAnalysisApp', ['ngMaterial','ngRoute','lfNgMdFileInput'])
logApp.config(['$routeProvider', '$compileProvider','$mdThemingProvider', function($routeProvider,$compileProvider,$mdThemingProvider){
    $compileProvider.debugInfoEnabled(false);
    // $mdThemingProvider.theme('default')
	$routeProvider
	.when('/login',	{
		templateUrl: 'views/login.html',
		controller: 'loginControl'
	})
	.when('/register',	{
		templateUrl: 'views/register.html',
		controller: 'registerControl'
	})
	.when('/home',	{
		templateUrl: 'views/filemenu.html',
		controller: 'fileUploadCtrl'
	})
	.when('/admin',	{
		templateUrl: 'views/adminpanel.html',
		controller: 'adminCtrl'
	})
	.when('/totalreport',	{
		templateUrl: 'views/total.html',
		controller: 'totalCtrl'
	})
	.otherwise({
		redirectTo: '/login'
	});
}])

logApp.constant('config', {
	apiUrl:'http://10.17.14.26:8080',
	serverUrl:'http://10.17.14.26:3000'
})

