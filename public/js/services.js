'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
    .value('version', '0.1')
    .factory("fetchResponseFactory", function($q, $timeout, $http){
        // return promise for response text for the given url
        var getResponseText = function(q_url){
            var deferred = $q.defer();
//            console.log('fetching url: ', q_url);

            deferred.resolve(
                $.ajax({
                    url: q_url,
                    type: 'GET',
                    success: function(res) {
//                        console.log('returning response for url: '+ q_url);
                        return res;
                    }
                })
            );
            // $timeout(function(){
            //     deferred.resolve('This is the text');
            // }, 2000)

            return deferred.promise;
        };

        var getActorMovies = function(actor_link1){
            var deferred = $q.defer();
//            console.log('fetching url: ', actor_link1);

            deferred.resolve(
                $.ajax({
                    url: 'http://www.imdb.com'+actor_link1,
                    type: 'GET',
                    success: function(res) {
//                        console.log('returning response for url: '+ actor_link1);
                        return res;
                    }
                })
            );

            return deferred.promise;
        };

        var getRating = function(movie_id){
            var deferred = $q.defer();
//            console.log('fetching rating: ', movie_id);
            var API_URL = 'http://www.omdbapi.com/?i=';
            var url = API_URL + movie_id;
            deferred.resolve(
                $http.get(url).success(function(res) {
                    return res;
                })
            );
            return deferred.promise;
        };

        var getPicture = function(name) {
            var deferred = $q.defer();
            var API_URL = "https://www.googleapis.com/freebase/v1/search?filter=(all+type:/people/person+domain:/film)&limit=1&query=";
            var url = API_URL + name.replace(" ","+");
            deferred.resolve(
                $http.get(url).success(function(res) {
                    return res;
                })
            );
            return deferred.promise;
        }

        return {
            getResponseText : getResponseText,
            getActorMovies : getActorMovies,
            getRating : getRating,
            getPicture: getPicture
        };
    })


    .service('AutoComplete', function($q, $http){
        var API_URL = 'http://sg.media-imdb.com/suggests/';
        this.autocomplete_search = function(term) {
            var url = API_URL+term[0]+"/"+term+".json";
//            console.log(url);
            $http.jsonp(url);
        }
    });
