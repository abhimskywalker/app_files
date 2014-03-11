'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'ngResource',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'ngAnimate',
  'ui.utils',
  'ui.bootstrap',
  'angulartics',
  'angulartics.google.analytics',
  "firebase",
  'angularSpinner',
        'ngTagsInput'
])
.config(function($routeProvider, $httpProvider, $parseProvider) {
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
  $httpProvider.defaults.transformResponse = [];
  $httpProvider.defaults.transformRequest.push(function (data, headerGetter) {
        // console.log("transform Request");
        return data;
    });
  $httpProvider.defaults.transformResponse = [];
  $httpProvider.defaults.transformResponse.push(function (data, headerGetter) {
        // console.log("transform Response");
        // console.log(data);
        return data;
    });
  $routeProvider.when('/', {templateUrl: 'partials/home.html', controller: 'Home'});
  $routeProvider.otherwise({redirectTo: '/'});
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
  $parseProvider.unwrapPromises(true);
})
// .config(['$routeProvider', ,'$httpProvider', function($routeProvider, $httpProvider) {
//     // $httpProvider.defaults.useXDomain = true;
//     // delete $httpProvider.defaults.headers.common['X-Requested-With'];
//     $routeProvider.when('/', {templateUrl: 'partials/home.html', controller: 'Home'});
//     $routeProvider.otherwise({redirectTo: '/'});
//   }
// ]);
// .factory('XDomainData', function ($http) {
//         return{
//             doCrossDomainGet: function(url_address) {
//                 return $http({
//                     url:url_address,
//                     method: 'GET'
//                 })
//             }
//         }
// })
// ;
