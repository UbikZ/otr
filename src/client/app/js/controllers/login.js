'use strict';

var toastr = require('toastr');

module.exports = ['$scope', 'authService',
  function ($scope, authService) {
    $scope.login = function (user) {
      authService.login(user, function(res) {
        console.log(res);
      }, function(err) {
        toastr.error(err.message);
      });
    };

    $scope.logout = function() {

    }
  }
];