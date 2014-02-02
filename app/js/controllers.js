'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('Home', function($scope, $http, $resource) {
  // controller('Home', function($scope, $http, XDomainData) {
    $scope.actor_names = '';
    $scope.movies = [];
    $scope.q_url1 = '';
    // $scope.factory = XDomainData;

    $scope.fetchResults = function(){
        var movie_list = [
            {title:'Oceans 11', year: 2000},
            {title:'Oceans 12', year: 2004},
            {title:'Oceans 13', year: 2006}
        ];
        console.log('Yay Search got clicked for:' + $scope.actor_names );
        console.log($scope);
        $scope.movies = movie_list;
        var actor1 = $scope.actor_names.split(',')[0].trim().split(' ').join('+');
        var actor2 = $scope.actor_names.split(',')[1].trim().split(' ').join('+');
        $scope.q_url1 = 'http://www.imdb.com/find?q='+actor1+'&s=nm';
        $scope.q_url2 = 'http://www.imdb.com/find?q='+actor2+'&s=nm';
        // $scope.from_url1 = $scope.factory.doCrossDomainGet($scope.q_url1);
        // $scope.from_url2 = $scope.factory.doCrossDomainGet($scope.q_url2);
        // $http.jsonp($scope.q_url1).success(function(data) {
        //     console.log(data);
        //     $scope.actor1_movies = data;
        // });
        $.ajax({
            // url: 'http://www.google.com',
            url: $scope.q_url1,
            type: 'GET',
            success: function(res) {
                // var headline = $(res.responseText).find('a.tsh').text();
                // alert(headline);
                console.log(res);
            }
        });
        // $.ajax({
        //   // url: "http://localhost:3311/get-data",
        //   url: $scope.q_url1,
        //   type: 'GET',
        //   dataType: 'json'
        // })
        // .done(function(data) {
        //     console.log(data);
        //     // $rootScope.$apply(function() {d.resolve(data); });
        // })
        // .fail(function(data) {
        //     // $rootScope.$apply(function() {d.reject(data); });
        // });
        // var data1 = $resource($scope.q_url1);
        // data1.get({}, function (data1) {
        //     console.log(data1);
        //     $scope.data1 = data1;
        // });
    }
  })
  ;
