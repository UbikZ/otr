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
        function scrolling() {
          $timeout(function(){
            element.slimscroll({
              height: scope.boxHeight,
              railOpacity: 0.9,
              start: 'bottom',
              scrollTo: ($(element[0]).find('div').length * 67)+'px',
            });
          })
        }

        scrolling();

        scope.$on('chat.scroll.bottom', function(event, data) { scrolling(); });
      }
    };
  }
];