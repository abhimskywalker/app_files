'use strict';

/* Directives */


angular.module('myApp.directives', [])

    .directive('appVersion', ['version', function(version) {
        return function(scope, elm, attrs) {
            elm.text(version);
        };
    }])

    .directive('onlinestatus', function(){
        return function (scope, element, attrs) {
            element.bind("keydown keypress keyup mousedown mouseup mousemove", function(evt) {
                scope.online_status = new Date().getTime();
                scope.$apply();
//                console.log(scope.online_status);
            });
        }
    })
;
