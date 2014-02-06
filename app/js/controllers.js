'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
    controller('Home', function($scope, $http, $resource, $timeout, $q, fetchResponseFactory) {
        // controller('Home', function($scope, $http, XDomainData) {
        $scope.actor_names = '';
        $scope.movies = [];
        $scope.q_url1 = '';
        $scope.complete = false;
//        $scope.complete2 = false;


        $scope.collect_list_items = function(div_list, role){

            var movies_1 = [];
            for (var i = div_list.length - 1; i >= 0; i--) {
                var movie_id = div_list[i].getAttribute('id').split('-')[1];
                var movie_name = $(div_list[i]).find('a')[0].textContent;
                var year = $(div_list[i]).find('span.year_column')[0].textContent.trim();
                var link = $(div_list[i]).find('a')[0].getAttribute('href');
                movies_1.push({'movie_id':movie_id,'movie_name':movie_name,'year':year,'role':role,'link':'http://www.imdb.com'+link});
                if (i==0){
                    return movies_1
                }
            };


        }

        $scope.collect_cateogry = function(movies_raw_data1, cat){

            var xpath = 'div#filmography div#filmo-head-' + cat;

            if ($(movies_raw_data1).find(xpath).length == 1){
                var div_list = $($(movies_raw_data1).find(xpath)[0].nextElementSibling).find('div.filmo-row');
                var movies_1 = $scope.collect_list_items(div_list, cat);
                return movies_1;
            }
            else{
                return [];
            };
        }

        $scope.parse_main_page = function(res, al1){

            var movies_raw_data1 = res;
            var movies_actor = $scope.collect_cateogry(movies_raw_data1, 'actor');
            var movies_actress = $scope.collect_cateogry(movies_raw_data1, 'actress');
            var movies_director = $scope.collect_cateogry(movies_raw_data1, 'director');
            var movies_1 = movies_actor.concat(movies_actress).concat(movies_director);
            return movies_1;
        }

        $scope.get_actor = function(res, url, actor_num, num_try){

            var deferred = $q.defer();

            if (num_try > 3) {
                deff.resolve([]);
            }

            var raw_data1 = res;
            var actor_name1 = $($(raw_data1).find('table.findList tbody tr')[0]).find('td.result_text a')[0];

            if (actor_name1 != undefined) {
                actor_name1 = actor_name1.textContent;
                var actor_link1 = $($(raw_data1).find('table.findList tbody tr')[0]).find('td.result_text a')[0].getAttribute('href');
                var movies_1 = [];
                fetchResponseFactory.getActorMovies(actor_link1)
                    .then(function(result){
                        movies_1 = $scope.parse_main_page(result['results'][0], actor_link1);
                        var actor1_pic_url = $(result['results'][0]).find('#name-poster')[0].getAttribute('src');
                        console.log('Variables assigned for actor: ', actor_name1);
                        deferred.resolve(
                            [actor1_pic_url, actor_name1, actor_link1, movies_1]
                        );
                    }, function(reason){
                        console.log(reason);
                    });
            }
            else{
                console.log('actor_name1: ', actor_name1);
                console.log('trying again');
                $scope.populate_actor(url, actor_num, num_try+1);
                deferred.resolve([]);
            }

            return deferred.promise;
        }




        $scope.call_intersection = function() {

            console.log('intersection calculation initiated');
            var intersection_movies = [];

            for (var i = $scope.movies_1.length - 1; i >= 0; i--) {
                for (var j = $scope.movies_2.length - 1; j >= 0; j--) {
                    if ($scope.movies_1[i]['movie_id'] === $scope.movies_2[j]['movie_id']) {
                        var m1 = $scope.movies_1[i];
                        var m2 = $scope.movies_2[j];
                        intersection_movies.push({'movie_id':m1['movie_id'],'movie_name':m1['movie_name'],'year':m1['year'],'a1_role':m1['role'],'a2_role':m2['role'],'link':m1['link']});
                    };

                    if (i===0 && j===0) {
                        $scope.movies = intersection_movies;
                    };
                };
            };
            $scope.complete = false;
        }



        $scope.populate_actor = function(url, actor_num, num_try) {

            fetchResponseFactory.getResponseText(url)
                .then(function(result){
                    var deferred = $q.defer();
                    $scope.get_actor(result['results'][0], url, actor_num, num_try)
                        .then(function(list_obj){
                            if (list_obj.length > 0) {
                                if (actor_num == 1) {
                                    $scope.actor1_pic_url = list_obj[0];
                                    $scope.actor_name1 = list_obj[1];
                                    $scope.actor_link1 = list_obj[2];
                                    $scope.movies_1 = list_obj[3];
                                }
                                else {
                                    $scope.actor2_pic_url = list_obj[0];
                                    $scope.actor_name2 = list_obj[1];
                                    $scope.actor_link2 = list_obj[2];
                                    $scope.movies_2 = list_obj[3];
                                }

                                if ($scope.complete == true) {
                                    $scope.call_intersection();
                                }
                                else {
                                    $scope.complete = true;
//                                $scope.$apply();
                                    console.log('changing the flag', url, 'done');
                                }
                            }

                        })
                    ;
                }, function(reason){
                    console.log(reason);
                    // TODO: retry in case of failure first time...
                })
            ;

        }




        $scope.fetchResults = function(){

            console.log('Yay Search got clicked for:' + $scope.actor_names );
            var actor1 = $scope.actor_names.split(',')[0].trim().split(' ').join('+');
            var actor2 = $scope.actor_names.split(',')[1].trim().split(' ').join('+');
            $scope.q_url1 = 'http://www.imdb.com/find?q='+actor1+'&s=nm';
            $scope.q_url2 = 'http://www.imdb.com/find?q='+actor2+'&s=nm';

            $scope.populate_actor($scope.q_url1, 1, 0);
            $scope.populate_actor($scope.q_url2, 2, 0);

        }
    })
;
