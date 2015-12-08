'use strict';

module.exports = ['$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      // todo : externalize template ?
      template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
      controller: function ($scope, $element) {
        $scope.minimalize = function () {
          var $body = $('body');
          $body.toggleClass("mini-navbar");
          if (!$body.hasClass('mini-navbar') || $body.hasClass('body-small')) {
            $('#side-menu').hide();
            setTimeout(
              function () {
                $('#side-menu').fadeIn(500);
              }, 100);
          } else if ($body.hasClass('fixed-sidebar')){
            $('#side-menu').hide();
            setTimeout(
              function () {
                $('#side-menu').fadeIn(500);
              }, 300);
          } else {
            $('#side-menu').removeAttr('style');
          }
        }
      }
    };
  }
];
