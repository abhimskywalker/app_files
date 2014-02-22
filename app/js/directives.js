'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])

    .directive('keyboardPoster', function($parse, $timeout){
        var DELAY_TIME_BEFORE_POSTING = 0;
        return function(scope, elem, attrs) {

            var element = angular.element(elem)[0];
            var currentTimeout = null;

            element.oninput = function() {
                var model = $parse(attrs.postFunction);
                var poster = model(scope);

                if(currentTimeout) {
                    $timeout.cancel(currentTimeout)
                }
                currentTimeout = $timeout(function(){
                    poster(angular.element(element).val());
                }, DELAY_TIME_BEFORE_POSTING);
            }
        }
    })

;
