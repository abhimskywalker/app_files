'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('Home', function($scope, $http, $resource, $timeout, $q) {
  // controller('Home', function($scope, $http, XDomainData) {
    $scope.actor_names = '';
    $scope.movies = [];
    $scope.q_url1 = '';
    // $scope.factory = XDomainData;


    $scope.collect_list_items = function(div_list, role){

        console.log('collect list items was called.');

        var movies_1 = [];
        for (var i = div_list.length - 1; i >= 0; i--) {
            var movie_id = div_list[i].getAttribute('id').split('-')[1];
            var movie_name = $(div_list[i]).find('a')[0].textContent;
            var year = $(div_list[i]).find('span.year_column')[0].textContent.trim();
            var link = $(div_list[i]).find('a')[0].getAttribute('href');
            movies_1.push({'movie_id':movie_id,'movie_name':movie_name,'year':year,'role':role,'link':'http://www.imdb.com'+link});
            $timeout(function (){
                if (i == 0){
                    return movies_1;
                };
            }, 100);
        };

    }

    $scope.collect_cateogry = function(movies_raw_data1, cat){

        console.log('collect category was called');

        var xpath = 'div#filmography div#filmo-head-' + cat;

        if ($(movies_raw_data1).find(xpath).length == 1){
            var div_list = $($(movies_raw_data1).find(xpath)[0].nextElementSibling).find('div.filmo-row');
            var movies_1 = $scope.collect_list_items(div_list, cat);
            return movies_1;
        }
        else{
            console.log('Got nothing for ' + cat + '!!!');
            return [];
        };
    }


    $scope.parse_main_page = function(res, al1){

        console.log('parse main page was called');
        var movies_raw_data1 = res.responseText;
        var movies_actor = $scope.collect_cateogry(movies_raw_data1, 'actor');
        var movies_actress = $scope.collect_cateogry(movies_raw_data1, 'actress');
        var movies_director = $scope.collect_cateogry(movies_raw_data1, 'director');
        var movies_1 = movies_actor.concat(movies_actress).concat(movies_director);
        return movies_1;
    }

    $scope.get_actor = function(res, count_try, orig_first_url){

        console.log('get actor function was called');

        if (count_try < 2) {
            count_try += 1;
        }
        else {
            return;
        }

        var raw_data1 = res.responseText;
        var actor_name1 = $($(raw_data1).find('table.findList tbody tr')[0]).find('td.result_text a')[0];

        if (actor_name1 != undefined) {
            actor_name1 = actor_name1.textContent;
            var actor_link1 = $($(raw_data1).find('table.findList tbody tr')[0]).find('td.result_text a')[0].getAttribute('href');
            console.log(actor_name1, 'http:www.imdb.com'+actor_link1);
            var movies_1 = [];
            var defer1 = $q.defer();
            defer1.promise
                .then(function(actor_link1) {
                    // get actor1 movies
                    movies_1 = $.ajax({
                        url: 'http://www.imdb.com'+actor_link1,
                        type: 'GET',
                        success: function(res) {
                            console.log('Got a success once.');
                            var result_movies = [];
                            var defer1_1 = $q.defer();
                            defer1_1.promise
                                .then(function(actor_link1) {
                                    // get actor1 movies by parsing
                                    result_movies = $scope.parse_main_page(res, actor_link1);
                                });
                            defer1_1.resolve(actor_link1);
                            return result_movies;
                        }
                    });
                });
            defer1.resolve(actor_link1);
            return [actor_name1, actor_link1, movies_1];
        }
        // else {
        //     console.log('one try failed, trying again');
        //     $scope.get_first_result(orig_first_url);
        // }


    }

    $scope.get_first_result = function(req_url){
                $.ajax({
                    // url: 'http://www.google.com',
                    url: req_url,
                    type: 'GET',
                    success: function(res) {
                        // console.log(res);
                       // $scope.raw_data1 = res.responseText;
                       // $scope.actor_name1 = $($($scope.raw_data1).find('table.findList tbody tr')[0]).find('td.result_text a')[0].textContent;
                       // $scope.actor_link1 = $($($scope.raw_data1).find('table.findList tbody tr')[0]).find('td.result_text a')[0].getAttribute('href');
                       // console.log($scope.actor_name1, 'http:www.imdb.com'+$scope.actor_link1);
                       // $.ajax({
                       //     // url: 'http://www.google.com',
                       //     url: 'http://www.imdb.com'+$scope.actor_link1,
                       //     type: 'GET',
                       //     success: function(res) {
                       //         // console.log(res);
                       //         // console.log($scope);
                       //         // console.log($scope.movies_1);
                       //         $scope.movies_1 = $scope.parse_main_page(res, $scope.actor_link1);
                       //     }
                       // });
                        console.log('got results for query 1');
                        return res
                    }
                });
    }

    $scope.fetchResults = function(){
        var movie_list = [
            {title:'Oceans 11', year: 2000},
            {title:'Oceans 12', year: 2004},
            {title:'Oceans 13', year: 2006}
        ];
        console.log('Yay Search got clicked for:' + $scope.actor_names );
        // console.log($scope);
        $scope.movies = movie_list;
        var actor1 = $scope.actor_names.split(',')[0].trim().split(' ').join('+');
        var actor2 = $scope.actor_names.split(',')[1].trim().split(' ').join('+');
        $scope.q_url1 = 'http://www.imdb.com/find?q='+actor1+'&s=nm';
        $scope.q_url2 = 'http://www.imdb.com/find?q='+actor2+'&s=nm';
        var defer = $q.defer();
        defer.promise
              .then(function() {
                // Get the urls for two actors and then their movie lists
                var defer1 = $q.defer();
                var defer2 = $q.defer();
                defer1.promise
                    .then(function() {
                        // get actor1 page url
                        var response_text = $scope.get_first_result($scope.q_url1);
                        if (response_text == null){
                            console.log('Failed in first try. Going for second try!');
                            response_text = $scope.get_first_result($scope.q_url1);
                        }
                        console.log('Completed 1.1: first promise!');
                        return response_text;
                    })
                    .then(function(res) {
                        // get actor1 movie page
                        console.log('Completed 1.2: second promise!');
                        return $scope.get_actor(res, 0, $scope.q_url1);
                    })
                    .then(function(list_item) {
                        // get actor1 movie list
                        $scope.actor_name1 = list_item[0];
                        $scope.actor_link1 = list_item[1];
                        $scope.actor_movies1 = list_item[2];
                        console.log($scope.actor_name1, $scope.actor_link1, $scope.actor_movies1);
                        console.log('Completed 1.3: third promise!');
                    });
                defer1.resolve();
                // defer2.promise
                //     .then(function() {
                //         // get actor1 page url
                //         return $scope.get_first_result(url1);
                //     })
                //     .then(function(actor1_url) {
                //         // get actor1 movie list
                //         $scope.get_actor(res, 0, req_url)
                //     });
                // return actor1_url;
                console.log('Completed 1: first promise!');
              })
              .then(function() {
                console.log('Entered 2: second promise')
              })
              ;

        defer.resolve();
        console.log("All said and done!")
        // $scope.from_url1 = $scope.factory.doCrossDomainGet($scope.q_url1);
        // $scope.from_url2 = $scope.factory.doCrossDomainGet($scope.q_url2);
        // $http.jsonp($scope.q_url1).success(function(data) {
        //     console.log(data);
        //     $scope.actor1_movies = data;
        // });


//        $.ajax({
//            // url: 'http://www.google.com',
//            url: $scope.q_url2,
//            type: 'GET',
//            success: function(res) {
//                console.log('got results for query 2');
//                var list_item = $scope.get_actor(res);
//                $scope.actor_name2 = list_item[0];
//                $scope.actor_link2 = list_item[1];
//                $scope.actor_movies2 = list_item[2];
//                console.log($scope.actor_name2, $scope.actor_link2, $scope.actor_movies2);
//
//            }
//        });


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


//        $scope.find_inte
  })
  ;
