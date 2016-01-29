'use strict';

module.exports = [
  function () {
    return {
      restrict: 'A',
      template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()">' +
      '<i class="fa fa-bars"></i>' +
      '</a>',
      controller: function ($scope) {
        $scope.minimalize = function () {
          var $body = window.$('body');
          $body.toggleClass('mini-navbar');
          if (!$body.hasClass('mini-navbar') || $body.hasClass('body-small')) {
            $('#side-menu').hide();
            setTimeout(
              function () {
                $('#side-menu').fadeIn(500);
              }, 100);
          } else if ($body.hasClass('fixed-sidebar')) {
            $('#side-menu').hide();
            setTimeout(
              function () {
                $('#side-menu').fadeIn(500);
              }, 300);
          } else {
            $('#side-menu').removeAttr('style');
          }
        };
      }
    };
  }
];
