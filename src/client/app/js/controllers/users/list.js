'use strict';

var toastr = require('toastr');

module.exports = ['$scope', '$rootScope', 'userService',
  function ($scope, $rootScope, userService) {
    $scope.loading = true;

    userService.get({}, function (res) {
      $scope.loading = false;
      $scope.users = res.users;
    }, function (err) {
      $scope.loading = false;
      toastr.error(err.message);
    });
  }
];