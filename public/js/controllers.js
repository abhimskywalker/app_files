'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
    controller('Home', function($scope, $http, $resource, $timeout, $q, fetchResponseFactory, $analytics, $firebase, AutoComplete, usSpinnerService) {
        // controller('Home', function($scope, $http, XDomainData) {

        $scope.actor_names = [];
        $scope.actors_db = {};
        $scope.titles = [];
        $scope.autocomplete_dict = {};
        $scope.firebase_flag = 'on';
        $scope.fetching_flag = false;
        $scope.current_tags = [];
        $scope.html_resp_dict_page1 = {};
        $scope.html_resp_dict_page2 = {};
        $scope.page1_promises = {};
        $scope.page2_promises = {};
        $scope.image_links = {};
        $scope.rating_dict = {};

        document.getElementById('main-content-div').className = "visible";

        try {
            $scope.ref = new Firebase("https://blazing-fire-1777.firebaseio.com/actors/");
        }
        catch(err) {
            console.log("firebase unreachable", err);
        }

        $scope.sign_on_firebase = function() {
            try {
                $scope.moviedb = $firebase($scope.ref);
                var random = $scope.moviedb.$child('initiate');
                $scope.moviedb.$on('loaded',function(){
//                console.log('Firebase initiated:',random);
                });
            }
            catch(err) {
               console.log("firebase unreachable", err);
            }
        }

        $scope.sign_on_firebase();

        $scope.initiate_vars = function() {
            $scope.movies = [];
            $scope.movies_final = [];
            $scope.metadata = [];
            $scope.actor1 = '';
            $scope.q_url1 = '';
            $scope.movies_1 = [];
            $scope.actor_name1 = '';
        }


        $scope.collect_list_items = function(div_list, role){
            var movies_1 = [];
            for (var i = div_list.length - 1; i >= 0; i--) {
                var movie_id = div_list[i].getAttribute('id').split('-')[1];
                var movie_name = $(div_list[i]).find('a')[0].textContent;
                var year = $(div_list[i]).find('span.year_column')[0].textContent.trim();
                var link = $(div_list[i]).find('a')[0].getAttribute('href');
                movies_1.push({'movie_id':movie_id,'movie_name':movie_name,'year':year,'link':'http://www.imdb.com'+link});
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

            var last_resort_fn = function(){
                delete $scope.page1_promises[$scope.actor1];
                delete $scope.page2_promises[$scope.actor1];
                delete $scope.html_resp_dict_page1[$scope.actor1];
                delete $scope.html_resp_dict_page2[$scope.actor1];
                $scope.populate_actor(url, actor_num, num_try+1);
                deferred.resolve([]);
            }

            var helper_fn = function(page_source) {
                var actor_name1 = $($(res).find('table.findList tbody tr')[0]).find('td.result_text a')[0];
                if (actor_name1) {
                    actor_name1 = actor_name1.textContent;
                    var actor_link1 = $($(res).find('table.findList tbody tr')[0]).find('td.result_text a')[0].getAttribute('href');
                    var movies_1 = [];
                    movies_1 = $scope.parse_main_page(page_source);
                    var actor1_pic_url = $scope.image_links[$scope.actor1];

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
                    catch(err) {
                        var actor1_dob = '';
                    }

                    deferred.resolve(
                        [actor1_pic_url, actor_name1, actor_link1, movies_1, actor1_dob]
                    );
                }
                else {
                    last_resort_fn();
                }
            }

            if (num_try > 3) {
                deferred.resolve([]);
            }

            if (res) {
                var raw_data1 = res;
                if ($scope.actor1 in $scope.html_resp_dict_page2) {
                    helper_fn($scope.html_resp_dict_page2[$scope.actor1]);
                }
                else {
                    if ($scope.actor1 in $scope.page2_promises) {
                        $scope.page2_promises[$scope.actor1]
                            .then(function(res1) {
                                helper_fn($scope.html_resp_dict_page2[$scope.actor1]);
                            }
                        )
                    }
                    else {
                        $scope.buffer_call_page2(res, $scope.actor1)
                            .then(function(res1) {
                                helper_fn($scope.html_resp_dict_page2[$scope.actor1]);
                            });
                    }
                }
            }
            else {
                last_resort_fn();
            }
            return deferred.promise;
        }



        $scope.call_intersection = function() {

            var intersection_movies = [];

            if ($scope.movies_1) {
                if ($scope.movies.length > 0) {
                    for (var i = $scope.movies_1.length - 1; i >= 0; i--) {
                        for (var j = $scope.movies.length - 1; j >= 0; j--) {
                            if ($scope.movies_1[i]['movie_id'] === $scope.movies[j]['movie_id']) {
                                var m1 = $scope.movies_1[i];
                                var m2 = $scope.movies[j];
                                intersection_movies.push(
                                    {
                                        'movie_id':m1['movie_id'] || m2['movie_id'],
                                        'movie_name':m1['movie_name'] || m2['movie_name'],
                                        'year':m1['year'] || m2['year'],
                                        'link':m1['link'] || m2['link']
                                    }
                                );
                            };

                            if (i===0 && j===0) {
                                $scope.movies = intersection_movies;
                            };
                        };
                    };
                }

                else {
                    for (var i = $scope.movies_1.length - 1; i >= 0; i--) {
                        var m1 = $scope.movies_1[i];
                        intersection_movies.push({'movie_id':m1['movie_id'],'movie_name':m1['movie_name'],'year':m1['year'],'link':m1['link'], 'rating':m1['rating'], 'votes':m1['votes']});
                        if (i===0) {
                            $scope.movies = intersection_movies;
                        };
                    };
                }
            }

            if (intersection_movies.length == 0){
                intersection_movies.push({'movie_id':'','movie_name':'No results.','year':'','link':''});
            }

            if ($scope.current_tags[$scope.current_tags.length - 1] == $scope.actor1.split("+").join(" ")) {
                usSpinnerService.stop('spinner-1');
                $timeout.cancel($scope.spinner_promise);
                $scope.movies_final = $scope.movies;
                $scope.get_rating($scope.movies_final);
                $scope.fetching_flag = false;
            }
        }



        $scope.assign_actor1 = function(list_obj) {
            var actor1_pic_url = list_obj[0];
            var actor_name1 = list_obj[1];
            var actor_link1 = list_obj[2];
            $scope.movies_1 = list_obj[3];

            if (list_obj[4].length > 17) {
                var actor1_dob = '';
            }
            else {
                var actor1_dob = list_obj[4];
            }
            $scope.metadata.push([actor1_pic_url, actor_name1, actor_link1, actor1_dob ]);
        }



        $scope.check_to_call_intersection = function(){
            $scope.call_intersection();
        }



        $scope.populate_actor = function(url, actor_num, num_try) {

            var helper_fn = function(raw_data){
                $scope.get_actor(raw_data, url, actor_num, num_try)
                    .then(function(list_obj){
                        if (list_obj.length > 0) {
                            if ($scope.actor_name1 == list_obj[1] || $scope.actor_name1 == '') {
                                $scope.assign_actor1(list_obj);
                                $scope.actors_db[$scope.actor1] = list_obj;
                                $scope.moviedb.$child($scope.cleanName($scope.actor1.toLowerCase())).$set(list_obj);
                                $scope.check_to_call_intersection();
                            }
                        }
                    });
            }

            if ($scope.actor1 in $scope.html_resp_dict_page1) {
                helper_fn($scope.html_resp_dict_page1[$scope.actor1]);
            }
            else {
                if ($scope.actor1 in $scope.page1_promises) {
                    $scope.page1_promises[$scope.actor1].then(
                        function(res) {
                            helper_fn($scope.html_resp_dict_page1[$scope.actor1]);
                        }
                    )
                }
                else {
                    $scope.buffer_call_page1($scope.actor1)
                        .then(function(res) {
                            helper_fn($scope.html_resp_dict_page1[$scope.actor1]);
                        })
                }

            }
        }



        $scope.cleanName = function(name){

            var escapable = /[\\\"\x00-\x1f\x7f-\uffff]/g,
                meta = {    // table of character substitutions
                    '\b': '\\b',
                    '\t': '\\t',
                    '\n': '\\n',
                    '\f': '\\f',
                    '\r': '\\r',
                    '"' : '\\"',
                    '\\': '\\\\'
                };

            function quote(string) {
                escapable.lastIndex = 0;
                return escapable.test(string) ?
                     string.replace(escapable, function (a) {
                        var c = meta[a];
                        return typeof c === 'string' ? c :'';
                    }) :
                    string ;
            }

            name = name.split('.').join('');
            name = name.split('#').join('');
            name = name.split('$').join('');
            name = name.split('[').join('');
            name = name.split(']').join('');
            name = name.split('-').join(' ');
            name = name.split("'").join('');
            name = quote(name);
            return name;
        }



        $scope.fetchResults = function(){

            $scope.fetching_flag = true;

            if ($scope.firebase_flag == "off") {
                $scope.sign_on_firebase();
                $scope.sign_off_firebase();
            }
            $scope.initiate_vars();

            $timeout(function() {

                usSpinnerService.spin('spinner-1');

                $scope.spinner_promise = $timeout(function () {
                    usSpinnerService.stop('spinner-1');
                }, 60000);

                for (var i in $scope.current_tags) {
                    var actor_query = $scope.current_tags[i];
                    $scope.actor1 = actor_query.trim().split(' ').join('+');
                    $scope.q_url1 = 'http://www.imdb.com/find?q='+$scope.actor1+'&s=nm';
                    $scope.list_obj1 = $scope.moviedb.$child($scope.cleanName($scope.actor1.toLowerCase()));

                    if ($scope.actor1 in $scope.actors_db) {
                        $scope.assign_actor1($scope.actors_db[$scope.actor1]);
                        $scope.check_to_call_intersection();
                    }
                    else {
                        $scope.moviedb.$on('loaded',function(){
                            if ($scope.list_obj1.$getIndex().length > 0){
                                var temp = [$scope.list_obj1[0], $scope.list_obj1[1], $scope.list_obj1[2], $scope.list_obj1[3], $scope.list_obj1[4]];
                                $scope.assign_actor1(temp);
                                $scope.actors_db[$scope.actor1] = temp;
                                $scope.check_to_call_intersection();
                            }
                            else {
                                $scope.populate_actor($scope.q_url1, 1, 0);
                            }
                        });
                    }
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
                        if (titles[i]['l'] in {'Amir Khan':1}) {
                            continue;
                        }
                        else {
                            result.push($scope.cleanName(titles[i]['l']));
                        }

                    }
                }
            }
            $scope.titles = result.splice(0,4);
            $scope.ac_reload_flag = true;
            $scope.autocomplete_dict[term] = $scope.titles;
        }



        $scope.ac_search = function(term) {
            $scope.ac_reload_flag = false;
            term = term.trim();
            term = term.split(" ");

            if (term[1] == ""){
                term = term[0]
            }
            else {
                term = term.join("_");
            }
            var titles_temp = $scope.titles;

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

            var timeout_fn = function(counter) {
                if (counter < 20) {
                    counter++;
                    return $timeout(function() {
                        if ($scope.ac_reload_flag) {
                            if (!(titles_temp == $scope.titles)) {
                                return $scope.titles;
                            }

                        }
                        else {
                            return timeout_fn(counter);
                        }
                    },50);
                }
                else {
                    if (!(titles_temp == $scope.titles)) {
                        return $scope.titles;
                    }
                }
            }

            return timeout_fn(0);
        }



        $scope.get_rating = function(movies){

            var size = 0;

            var assign_rating_fn = function(){
                for (var j=0; j<size; j++) {
                    try {
                        movies[j]['rating'] = $scope.rating_dict[movies[j]['movie_id']][0];
                        movies[j]['votes'] = $scope.rating_dict[movies[j]['movie_id']][1];
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
            }

            for (var i = 0; i < movies.length; i++) {
                if (movies[i]['movie_id'] in $scope.rating_dict) {
                    size++;
                }
                else {
                    fetchResponseFactory.getRating(movies[i]['movie_id'])
                        .then(function(json_obj){
                            var res = JSON.parse(json_obj["data"]);
                            var rating = res['imdbRating'];
                            var votes = res['imdbVotes'];
                            if (votes == "N/A") {
                                votes = '';
                            }
                            var movie_id = res["imdbID"];
                            $scope.rating_dict[movie_id] = [rating, votes];
                            size++;
                            if (size == movies.length) {
                                assign_rating_fn();
                            }
                        });
                }
                if (size == movies.length) {
                    assign_rating_fn();
                }
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



        $scope.sign_off_firebase = function() {
            $timeout(function() {
                if (new Date().getTime() - $scope.online_status > 300000)  {
                    if ($scope.firebase_flag == "on") {
                        $scope.moviedb.$off('loaded');
                        $scope.ref.off();
                        $scope.firebase_flag = 'off';
                    }
                }
                else {
                    $scope.sign_off_firebase();
                }
            }, 30000);
        }

        $scope.sign_off_firebase();




        $scope.buffer_call_page1 = function(actor_query) {

            var page1_promise = $q.defer();
            $scope.page1_promises[actor_query] = page1_promise.promise;

            if (actor_query in $scope.html_resp_dict_page1) {
                page1_promise.resolve(function(){
                    return true;
                })
            }
            else {
                var url = 'http://www.imdb.com/find?q='+ actor_query +'&s=nm';
                fetchResponseFactory.getResponseText(url)
                    .then(function(result){
                        try {
                            result = result['results'][0];
                            if (result) {
                                var raw_data1 = result.split("src=").join("rips=");
                                $scope.html_resp_dict_page1[actor_query] = raw_data1;
                            }
                        }
                        catch (err) {
                            console.log('some error');

                        }
                        page1_promise.resolve(function(){
                            return true;
                        })

                    }, function(reason){
                        console.log(reason);
                    }) ;
            }
            return page1_promise.promise;
        }



        $scope.buffer_call_page2 = function(raw_data1, actor_query){
            var page2_promise = $q.defer();
            $scope.page2_promises[actor_query] = page2_promise.promise;

            if (actor_query in $scope.html_resp_dict_page2) {
                page2_promise.resolve(function(){
                    return true;
                })
            }
            else {
                var actor_name1 = $($(raw_data1).find('table.findList tbody tr')[0]).find('td.result_text a')[0];
                if (actor_name1) {

                    actor_name1 = actor_name1.textContent;
                    var actor_link1 = $($(raw_data1).find('table.findList tbody tr')[0]).find('td.result_text a')[0].getAttribute('href');

                    fetchResponseFactory.getActorMovies(actor_link1)
                        .then(function(result){
                            try {
                                result = result['results'][0];
                                if (result) {
                                    var page_source = result.split("src=").join("rips=");
                                    $scope.html_resp_dict_page2[actor_query] = page_source;
                                }
                            }
                            catch (err) {
                                console.log(err);
                            }

                            page2_promise.resolve(function(){
                                return true;
                            })

                        }, function(reason){
                            console.log(reason);
                    }) ;
                }
                else {
                    $scope.html_resp_dict_page2[actor_query] = '';
                        page2_promise.resolve(function(){
                            return true;
                        })
                }
            }
            return page2_promise.promise;
        }



        $scope.call_fetch_results = function(tag, call) {
            if ($scope.fetching_flag == false) {
                if (call == "push") {
                    $scope.current_tags.push(tag);
                }
                else {
                    $scope.current_tags.splice($scope.current_tags.indexOf(tag), 1);
                }
                $scope.fetchResults();
            }
            else {
                $timeout(function(){
                    $scope.call_fetch_results(tag, call);
                }, 100);
            }
        }


        $scope.on_tag_added = function(tag) {

            $scope.call_fetch_results(tag, 'push');

            var actor_query = tag.trim().split(' ').join('+');
            $scope.buffer_call_page1(actor_query).then(function(res){
                $scope.buffer_call_page2($scope.html_resp_dict_page1[actor_query], actor_query);
            });

            if (!(actor_query in $scope.image_links)) {
                fetchResponseFactory.getPicture(actor_query)
                    .then(function(pic_source) {
                        var pic_source = JSON.parse(pic_source["data"])
                        var actor1_pic_url = $scope.get_picture(pic_source);
                        $scope.image_links[actor_query] = actor1_pic_url;
                    });
            }

            $analytics.eventTrack('Search Actor', {  category: 'Actor:(' + tag + ')', label: 'Actor:' + tag });
            $analytics.eventTrack('Search Pair', {  category: 'Actor Pair:(' + $scope.actor_names.toString() + ')', label: 'Actors:' + $scope.actor_names.toString() });

        }


        $scope.on_tag_removed = function(tag) {
            if ($scope.actor_names.length > 0) {
                $scope.call_fetch_results(tag, 'pop');
            }
            else {
                $scope.movies_final = [];
                $scope.current_tags = [];
                $scope.metadata = [];
            }
        }



    })
;
