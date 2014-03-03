'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
    controller('Home', function($scope, $http, $resource, $timeout, $q, fetchResponseFactory, $analytics, $firebase, AutoComplete, usSpinnerService) {
        // controller('Home', function($scope, $http, XDomainData) {

        $scope.actor_names = '';
        $scope.actors_db = {};
        $scope.autocomplete1 = '';
        $scope.autocomplete2 = '';
        $scope.titles = [];
        $scope.auto_comma = false;
        $scope.autocomplete_dict = {};

        var ref = new Firebase("https://blazing-fire-1777.firebaseio.com/actors/");
        $scope.moviedb = $firebase(ref);
        var random = $scope.moviedb.$child('initiate');
        $scope.moviedb.$on('loaded',function(){
//            console.log('Firebase initiated:',random);
        });


        $scope.initiate_vars = function() {

            $scope.movies = [];
            $scope.complete1 = false;
            $scope.complete2 = false;

            $scope.actor1 = '';
            $scope.q_url1 = '';
            $scope.movies_1 = [];
            $scope.actor1_pic_url = '';
            $scope.actor_name1 = '';
            $scope.actor_link1 = '';
            $scope.actor1_dob = '';

            $scope.actor2 = '';
            $scope.q_url2 = '';
            $scope.movies_2 = [];
            $scope.actor2_pic_url = '';
            $scope.actor_name2 = '';
            $scope.actor_link2 = '';
            $scope.actor2_dob = '';
            $scope.temp_var = '';
        }


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
                deferred.resolve([]);
            }
            if (res) {
                var raw_data1 = res.split("src=").join("rips=");
                var actor_name1 = $($(raw_data1).find('table.findList tbody tr')[0]).find('td.result_text a')[0];
                if (actor_name1) {
                    actor_name1 = actor_name1.textContent;
                    var actor_link1 = $($(raw_data1).find('table.findList tbody tr')[0]).find('td.result_text a')[0].getAttribute('href');
                    var movies_1 = [];
                    fetchResponseFactory.getActorMovies(actor_link1)
                        .then(function(result){
                            result = result['results'][0];
                            if (result) {
                                var page_source = result.split("src=").join("rips=");
                                movies_1 = $scope.parse_main_page(page_source, actor_link1);
//                                try {
//                                    var actor1_pic_url = $(page_source).find('#name-poster')[0].getAttribute('rips');
//                                }
//                                catch(err) {
//                                    var actor1_pic_url = '';
//                                }
                                var actor1_pic_url = $scope.get_actor_pic_url(actor_num);

                                try {
                                    var actor1_dob_md = $(page_source).find('div#name-born-info a')[1].text;
                                    var actor1_dob_y = $(page_source).find('div#name-born-info a')[2].text;
                                    if(actor1_dob_md.trim().length > 12){
                                        actor1_dob_md = ''
                                    }
                                    if(actor1_dob_y.trim().length > 4){
                                        actor1_dob_y = ''
                                    }
                                    var actor1_dob = actor1_dob_md + ' ' + actor1_dob_y;
                                }
                                catch(err)
                                {
                                    var actor1_dob = '';
                                }
//                                console.log('Variables assigned for actor: ', actor_name1);
                                deferred.resolve(
                                    [actor1_pic_url, actor_name1, actor_link1, movies_1, actor1_dob]
                                );
                            }

                        }, function(reason){
                            console.log(reason);
                    });
                }
            }
            else {
    //            console.log('actor_name1: ', actor_name1);
    //            console.log('trying again');
                $scope.populate_actor(url, actor_num, num_try+1);
                deferred.resolve([]);
            }
            return deferred.promise;
        }


        $scope.call_intersection = function() {

//            console.log('intersection calculation initiated');
            $analytics.eventTrack('Search Pair', {  category: 'Actor Pair:(' + $scope.actor_name1 + ',' + $scope.actor_name2 + ')', label: 'Actors:' + $scope.actor_name1 + ',' + $scope.actor_name2 });
            $analytics.eventTrack('Search Actor', {  category: 'Actor:(' + $scope.actor_name1 + ')', label: 'Actor:' + $scope.actor_name1 });
            $analytics.eventTrack('Search Actor', {  category: 'Actor:(' + $scope.actor_name2 + ')', label: 'Actor:' + $scope.actor_name2 });
            var intersection_movies = [];

            if ($scope.movies_1 && $scope.movies_2) {
                for (var i = $scope.movies_1.length - 1; i >= 0; i--) {
                    for (var j = $scope.movies_2.length - 1; j >= 0; j--) {
                        if ($scope.movies_1[i]['movie_id'] === $scope.movies_2[j]['movie_id']) {
                            var m1 = $scope.movies_1[i];
                            var m2 = $scope.movies_2[j];
                            intersection_movies.push({'movie_id':m1['movie_id'],'movie_name':m1['movie_name'],'year':m1['year'],'a1_role':m1['role'],'a2_role':m2['role'],'link':m1['link'], 'rating':'', 'votes':''});
                        };

                        if (i===0 && j===0) {
                            usSpinnerService.stop('spinner-1');
                            $scope.movies = intersection_movies;
                            $scope.get_rating();
                        };
                    };
                };
            }
            if (intersection_movies.length == 0){
                intersection_movies.push({'movie_id':'','movie_name':'No results.','year':'','a1_role':'','a2_role':'','link':''});
            }
            usSpinnerService.stop('spinner-1');
            $scope.complete1 = false;
            $scope.complete2 = false;
        }

        $scope.assign_actor1 = function(list_obj) {
//            console.log('Assigning for actor 1')
            $scope.actor1_pic_url = list_obj[0];
            $scope.actor_name1 = list_obj[1];
            $scope.actor_link1 = list_obj[2];
            $scope.movies_1 = list_obj[3];
            $scope.actor1_dob = list_obj[4];
        }

        $scope.assign_actor2 = function(list_obj) {
//            console.log('Assigning for actor 2')
            $scope.actor2_pic_url = list_obj[0];
            $scope.actor_name2 = list_obj[1];
            $scope.actor_link2 = list_obj[2];
            $scope.movies_2 = list_obj[3];
            $scope.actor2_dob = list_obj[4];
        }


        $scope.check_to_call_intersection = function(url, actor_num){
//            if ($scope.complete1 == true && $scope.complete2 == true) {
//                $scope.call_intersection();
//            }
            if (actor_num == 1){
                $scope.complete1 = true;
//                console.log('changing the flag', url, 'done for 1');
            }
            else {
                $scope.complete2 = true;
//                console.log('changing the flag', url, 'done for 2');
            }

            if ($scope.complete1 == true && $scope.complete2 == true) {
                $scope.call_intersection();
            }
        }


        $scope.populate_actor = function(url, actor_num, num_try) {

            fetchResponseFactory.getResponseText(url)
                .then(function(result){
                    $scope.get_actor(result['results'][0], url, actor_num, num_try)
                        .then(function(list_obj){
                            if (list_obj.length > 0) {
                                if (actor_num == 1) {
                                    if ($scope.actor_name1 == list_obj[1] || $scope.actor_name1 == '') {
//                                        console.log('Actor 1 updated');
                                        $scope.assign_actor1(list_obj);
                                        $scope.actors_db[$scope.actor1] = list_obj;
                                        $scope.moviedb.$child($scope.cleanName($scope.actor1)).$set(list_obj);
                                        $scope.check_to_call_intersection(url, 1);
                                    }
                                }
                                else {
                                    if ($scope.actor_name2 == list_obj[1] || $scope.actor_name2 == '') {
//                                        console.log('Actor 2 updated');
                                        $scope.assign_actor2(list_obj);
                                        $scope.actors_db[$scope.actor2] = list_obj;
                                        $scope.moviedb.$child($scope.cleanName($scope.actor2)).$set(list_obj);
                                        $scope.check_to_call_intersection(url, 2);
                                    }
                                }
//                                $scope.check_to_call_intersection(url,3);
                            }
                        });

                }, function(reason){
                    console.log(reason);
                    // TODO: retry in case of failure first time...
                }) ;
        }

        $scope.cleanName = function(name){
            name = name.replace('.','')
            name = name.replace('#','')
            name = name.replace('$','')
            name = name.replace('[','')
            name = name.replace(']','')
            return name
        }

        $scope.fetchResults = function(){

            $timeout(function() {
                usSpinnerService.spin('spinner-1');
                $scope.initiate_vars();
//                console.log('Yay Search got clicked for:' + $scope.actor_names );
                $scope.actor1 = $scope.actor_names.split(',')[0].trim().split(' ').join('+');
                $scope.actor2 = $scope.actor_names.split(',')[1].trim().split(' ').join('+');
                $scope.q_url1 = 'http://www.imdb.com/find?q='+$scope.actor1+'&s=nm';
                $scope.q_url2 = 'http://www.imdb.com/find?q='+$scope.actor2+'&s=nm';
                $scope.list_obj1 = $scope.moviedb.$child($scope.cleanName($scope.actor1));
                $scope.list_obj2 = $scope.moviedb.$child($scope.cleanName($scope.actor2));

                if ($scope.actor1 in $scope.actors_db) {
                    $scope.assign_actor1($scope.actors_db[$scope.actor1]);
                    $scope.check_to_call_intersection($scope.q_url1, 1);
                }
                else {
                    $scope.moviedb.$on('loaded',function(){
//                        console.log('From the on method: firebase: actor, length:',$scope.actor1, $scope.list_obj1.$getIndex().length);
                        if ($scope.list_obj1.$getIndex().length > 0){
//                            console.log('Got info from firebase for:',$scope.actor1)
                            var temp = [$scope.list_obj1[0], $scope.list_obj1[1], $scope.list_obj1[2], $scope.list_obj1[3], $scope.list_obj1[4]];
                            $scope.assign_actor1(temp);
                            $scope.actors_db[$scope.actor1] = temp;
                            $scope.check_to_call_intersection($scope.q_url1,1);
                        }
                        else {
                            $scope.populate_actor($scope.q_url1, 1, 0);
                            fetchResponseFactory.getPicture($scope.autocomplete1, 1);
                        }
                    });
//
                }

                if ($scope.actor2 in $scope.actors_db) {
                    $scope.assign_actor2($scope.actors_db[$scope.actor2]);
                    $scope.check_to_call_intersection($scope.q_url2, 2);
                }
                else {
                    $scope.moviedb.$on('loaded',function(){
//                        console.log('firebase: actor, length:',$scope.actor2, $scope.list_obj2.$getIndex().length)
                        if ($scope.list_obj2.$getIndex().length > 0){
//                            console.log('Got info from firebase for:',$scope.actor2)
                            var temp = [$scope.list_obj2[0],$scope.list_obj2[1],$scope.list_obj2[2],$scope.list_obj2[3],$scope.list_obj1[3]]
                            $scope.assign_actor2(temp);
                            $scope.actors_db[$scope.actor2] = temp;
                            $scope.check_to_call_intersection($scope.q_url2,2);
                        }
                        else {
                            $scope.populate_actor($scope.q_url2, 2, 0);
                            fetchResponseFactory.getPicture($scope.autocomplete2, 2);
                        }
                    });
                }
            }, 5);

        }



        $scope.title_parser = function(term, json_obj) {

            var titles = json_obj["d"];
            var result = [];

            for (var i = 0; i < titles.length; i++) {
                var obj = titles[i];
                if ('s' in obj) {
                    if (titles[i]["q"] in {'TV movie':1, 'video':1, 'feature':1, 'TV documentary':1, 'TV series':1, "documentary":1, "short":1, "video game":1}) {
                        continue;
                    }
                    else {
                        result.push(titles[i]['l']);
                    }
                }
            }
            $scope.titles = result.splice(0,4);
            $scope.ac_reload_flag = true;
            $scope.autocomplete_dict[term] = $scope.titles;
        }



        $scope.ac_search = function(term) {
            $scope.ac_reload_flag = false;
            if (term != $scope.autocomplete1 + ", " + $scope.autocomplete2) {
                if (term.indexOf(',') > -1){
                    var typed = term.trim().split(",");
                    if ($scope.autocomplete1 == typed[0].trim() && $scope.autocomplete1 != "") {
                        $scope.autocomplete2 = "";
                        term = typed[1].trim();
                    }
                    else if ($scope.autocomplete2 == typed[1].trim() && $scope.autocomplete2 != ""){
                        $scope.autocomplete1 = "";
                        term = typed[0].trim();
                    }
                    else if (!$scope.auto_comma) {
                        $scope.autocomplete1 = typed[0].trim();
                        term = typed[1].trim();
                    }
                }
                else {
                    var index2 = term.indexOf($scope.autocomplete2);
                    if (index2 > -1 && $scope.autocomplete2 != "") {
                        term = term.substr(0,index2).trim();
                    }
                    else {
                        $scope.autocomplete2 = "";
                    }
                    $scope.autocomplete1 = "";
                }

                term = term.split(" ");

                if (term[1] == ""){
                    term = term[0]
                }
                else {
                    term = term.join("_");
                }

                if (term.length > 0) {
                    if (term in $scope.autocomplete_dict) {
                        $scope.titles = $scope.autocomplete_dict[term];
                        $scope.ac_reload_flag = true;
                    }
                    else {
                        eval("window.imdb$"+term+" = function(d){$scope.title_parser(term, d)};");
                        AutoComplete.autocomplete_search(term.toLowerCase());
                    }
                }
            }

            var timeout_fn = function(counter) {
                if (counter < 20) {
                    counter++;
                    return $timeout(function() {
                        if ($scope.ac_reload_flag) {
                            return $scope.titles;
                        }
                        else {
                            return timeout_fn(counter);
                        }
                    },50);
                }
                else {
                    return $scope.titles;
                }
            }

            return timeout_fn(0);
        }



        $scope.add_comma = function() {
            $timeout(function() {
                var term = document.getElementById("actor-names").value;
                if ($scope.autocomplete1 == "") {
                    $scope.autocomplete1 = term;
                }
                else {
                    $scope.autocomplete2 = term;
                }
                document.getElementById("actor-names").value = $scope.autocomplete1 + ", " + $scope.autocomplete2;
                $scope.auto_comma = true;
                $scope.actor_names = $scope.autocomplete1 + ", " + $scope.autocomplete2;
            },2) ;
        }


        $scope.get_rating = function(){
            $scope.rating_dict = {};
            var size = 0;
            for (var i = 0; i < $scope.movies.length; i++) {
                fetchResponseFactory.getRating($scope.movies[i]['movie_id'])
                    .then(function(json_obj){
                        var res = JSON.parse(json_obj["data"]);
                        var rating = res['imdbRating'];
                        var votes = res['imdbVotes'];
                        var movie_id = res["imdbID"];
                        $scope.rating_dict[movie_id] = [rating, votes];
                        size++;
                        if (size == $scope.movies.length) {
                            for (var j=0; j<size; j++) {
                                $scope.movies[j]['rating'] =   $scope.rating_dict[$scope.movies[j]['movie_id']][0];
                                $scope.movies[j]['votes'] =   $scope.rating_dict[$scope.movies[j]['movie_id']][1];
                            }
                        }
                    })

            }
        }

        $scope.get_picture = function(res){
            try {
                if (res["status"] == "200 OK") {
                   return "https://www.googleapis.com/freebase/v1/image" + res["result"][0]["mid"] + "?maxheight=200&maxwidth=200";
                }
                else {
                    return "";
                }
            }
            catch (err) {
                console.log(err);
                return "";
            }
        }


        window.picture_CALLBACK1 = function(res) {
            $scope.actor1_pic_url = $scope.get_picture(res);
        }

        window.picture_CALLBACK2 = function(res) {
            $scope.actor2_pic_url = $scope.get_picture(res);
        }

        $scope.get_actor_pic_url = function(actor_num) {
            if (actor_num == 1) {
                return $scope.actor1_pic_url;
            }
            else {
                return $scope.actor2_pic_url;
            }
        }


    })
;
