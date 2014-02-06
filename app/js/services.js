'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
    .value('version', '0.1')
    .factory("fetchResponseFactory", function($q, $timeout){
        // return promise for response text for the given url
        var getResponseText = function(q_url){
            var deferred = $q.defer();
            console.log('fetching url: ', q_url);

            deferred.resolve(
                $.ajax({
                    url: q_url,
                    type: 'GET',
                    success: function(res) {
                        console.log('returning response for url: '+ q_url);
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
            console.log('fetching url: ', actor_link1);

            deferred.resolve(
                $.ajax({
                    url: 'http://www.imdb.com'+actor_link1,
                    type: 'GET',
                    success: function(res) {
                        console.log('returning response for url: '+ actor_link1);
                        return res;
                    }
                })
            );

            return deferred.promise;
        };

        return {
            getResponseText : getResponseText,
            getActorMovies : getActorMovies
        };
    });
