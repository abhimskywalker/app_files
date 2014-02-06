'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('Home', function($scope, $http, $resource, $timeout, $q, fetchResponseFactory) {
  // controller('Home', function($scope, $http, XDomainData) {
    $scope.actor_names = '';
    $scope.movies = [];
    $scope.q_url1 = '';

    $scope.collect_list_items = function(div_list, role){

        // console.log('collect list items was called.');


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

        // console.log('collect category was called');

        var xpath = 'div#filmography div#filmo-head-' + cat;

        if ($(movies_raw_data1).find(xpath).length == 1){
            var div_list = $($(movies_raw_data1).find(xpath)[0].nextElementSibling).find('div.filmo-row');
            var movies_1 = $scope.collect_list_items(div_list, cat);
            console.log('Returning list for '+ cat);
            // console.log(movies_1);
            return movies_1;
        }
        else{
            console.log('Got nothing for ' + cat + '!!!');
            return [];
        };
    }

    $scope.parse_main_page = function(res, al1){

        console.log('parse main page was called');
        var movies_raw_data1 = res;
        var movies_actor = $scope.collect_cateogry(movies_raw_data1, 'actor');
        var movies_actress = $scope.collect_cateogry(movies_raw_data1, 'actress');
        var movies_director = $scope.collect_cateogry(movies_raw_data1, 'director');
        var movies_1 = movies_actor.concat(movies_actress).concat(movies_director);
        return movies_1;
    }

    $scope.get_actor1 = function(res){

        var deferred = $q.defer();

        var raw_data1 = res;
        var actor_name1 = $($(raw_data1).find('table.findList tbody tr')[0]).find('td.result_text a')[0];

        if (actor_name1 != undefined) {
            actor_name1 = actor_name1.textContent;
            var actor_link1 = $($(raw_data1).find('table.findList tbody tr')[0]).find('td.result_text a')[0].getAttribute('href');
            var movies_1 = [];
            fetchResponseFactory.getActorMovies(actor_link1)
                .then(function(result){
                    movies_1 = $scope.parse_main_page(result['results'][0], actor_link1);
                    $scope.actor1_pic_url = $(result['results'][0]).find('#name-poster')[0].getAttribute('src');
                    $scope.actor_name1 = actor_name1;
                    $scope.actor_link1 = actor_link1;
                    $scope.movies_1 = movies_1;
                    console.log('Variables assigned for actor1');
                    // return [actor_name1,actor_link1,movies_1];
                    deferred.resolve(
                        [actor_name1,actor_link1,movies_1]
                    );
                }
                );
        }
        else{
            console.log('actor_name1:');
            console.log(actor_name1);
            // return ''
            deferred.resolve(
                []
            );
        }

        return deferred.promise;
    }

    $scope.get_actor2 = function(res){

        var deferred = $q.defer();

        var raw_data1 = res;
        var actor_name1 = $($(raw_data1).find('table.findList tbody tr')[0]).find('td.result_text a')[0];

        if (actor_name1 != undefined) {
            actor_name1 = actor_name1.textContent;
            var actor_link1 = $($(raw_data1).find('table.findList tbody tr')[0]).find('td.result_text a')[0].getAttribute('href');
            var movies_1 = [];
            fetchResponseFactory.getActorMovies(actor_link1)
                .then(function(result){
                    movies_1 = $scope.parse_main_page(result['results'][0], actor_link1);
                    $scope.actor2_pic_url = $(result['results'][0]).find('#name-poster')[0].getAttribute('src');
                    $scope.actor_name2 = actor_name1;
                    $scope.actor_link2 = actor_link1;
                    $scope.movies_2 = movies_1;
                    console.log('Variables assigned for actor2');
                    // return [actor_name1,actor_link1,movies_1];
                    deferred.resolve(
                        [actor_name1,actor_link1,movies_1]
                    );
                }
                );
        }
        else{
            console.log('actor_name2:');
            console.log(actor_name1);
            // return ''
            deferred.resolve(
                []
            );
        }

        return deferred.promise;
    }

    $scope.fetchResults = function(){
        // var movie_list = [
        //     {title:'Oceans 11', year: 2000},
        //     {title:'Oceans 12', year: 2004},
        //     {title:'Oceans 13', year: 2006}
        // ];
        console.log('Yay Search got clicked for:' + $scope.actor_names );
        // $scope.movies = movie_list;
        var actor1 = $scope.actor_names.split(',')[0].trim().split(' ').join('+');
        var actor2 = $scope.actor_names.split(',')[1].trim().split(' ').join('+');
        $scope.q_url1 = 'http://www.imdb.com/find?q='+actor1+'&s=nm';
        $scope.q_url2 = 'http://www.imdb.com/find?q='+actor2+'&s=nm';
        fetchResponseFactory.getResponseText($scope.q_url1)
            .then(function(result){
                $scope.get_actor1(result['results'][0])
                    .then(function(){
                        console.log('Finished promise for actor 1');
                        fetchResponseFactory.getResponseText($scope.q_url2)
                            .then(function(result){
                                $scope.get_actor2(result['results'][0])
                                    .then(function(){
                                        console.log('Finished promise for actor 2');
                                        // Get the intersection of the movies
                                        // console.log("movie_list1:");
                                        // console.log($scope.movies_1);
                                        // console.log("movie_list2:");
                                        // console.log($scope.movies_2);
                                        var intersection_movies = [];
                                        for (var i = $scope.movies_1.length - 1; i >= 0; i--) {
                                            for (var j = $scope.movies_2.length - 1; j >= 0; j--) {
                                                // console.log('Comparing for i: '+i+' and j: '+j+' i.e. id: '+$scope.movies_1[i]['movie_id']+' to id: '+$scope.movies_2[j]['movie_id']);
                                                // console.log($scope.movies_1[i]['movie_id']==$scope.movies_2[j]['movie_id']);
                                                if ($scope.movies_1[i]['movie_id'] === $scope.movies_2[j]['movie_id']) {
                                                    var m1 = $scope.movies_1[i];
                                                    var m2 = $scope.movies_2[i];
                                                    intersection_movies.push({'movie_id':m1['movie_id'],'movie_name':m1['movie_name'],'year':m1['year'],'a1_role':m1['role'],'a2_role':m2['role'],'link':m1['link']});
                                                    // intersection_movies.push($scope.movies_1[i]);
                                                };
                                                if (i===0 && j===0) {
                                                    $scope.movies = intersection_movies;
                                                    // console.log('intersection_movies');
                                                    // console.log(intersection_movies);
                                                };
                                            };
                                        };
                                        // console.log('DONE DONE DONE!!!')
                                    })
                                ;
                            }, function(reason){
                                console.log(reason);
                                // TODO: retry in case of failure first time...
                            })
                            ;
                    })
                ;
            }, function(reason){
                console.log(reason);
                // TODO: retry in case of failure first time...
            })
            ;

    }
  })
  ;
