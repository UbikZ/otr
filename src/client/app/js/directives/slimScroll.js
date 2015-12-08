'use strict';

require('jquery-slimscroll/jquery.slimscroll');

module.exports = ['$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      scope: {
        boxHeight: '@'
      },
      link: function(scope, element) {
        $timeout(function(){
          element.slimscroll({
            height: scope.boxHeight,
            railOpacity: 0.9
          });
        });
      }
    };
  }
];