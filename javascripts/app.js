angular.module('leftPart', ['ngRoute'])
	.controller('HomeController', function ($scope, $route) { $scope.$route = $route;})
	// .controller('BlogController', function ($scope, $route) { $scope.$route = $route;})
	.config(function($routeProvider, $locationProvider){
		$routeProvider
		.when('/home',{
			controller: 'HomeController',
			// template: {'hello'}
			templateUrl: function() {
				// console.log($location.path());
				return 'views/home.html';
			}
			// template: '这是第一个页面'
		})
		.when('/blogs',{
			// controller: BlogController,
			templateUrl: 'views/blogs.html'
		})
		.when('/computer_science',{
			// controller: BlogController,
			templateUrl: 'views/computer_science.html'
		})
		.when('/about',{
			// controller: BlogController,
			templateUrl: function(){
				location.href = '/about/2017/03/17/About.html';
			}
		})
		.when('/version',{
			// controller: BlogController,
			templateUrl: function(){
				location.href = '/version/2017/03/17/Version.html';
			}
		})
		.otherwise({
			redirectTo: '/home'
		});
		// $locationProvider.html5Mode(true);
	})
	.run(['$rootScope', '$location', function($rootScope, $location){
    $rootScope.$on('$routeChangeStart', function(evt, next, current){
    	$('#view').hide(500);
  }); 
}]);
// angular.directive('leftPart', function() {
//    return {
//        restrict: 'E',
//        link: function(scope, element, attrs) {
//            scope.getContentUrl = function() {
//                 return 'home.html';
//            }
//        },
//        template: '<div ng-include="getContentUrl()"></div>'
//    }
// });

// alert($location.path());