'use strict';

var toastr = require('toastr');

module.exports = ['$scope', '$rootScope', 'authService',
  function ($scope, $rootScope, authService) {
    $scope.loading = true;
    $scope.json = undefined;
    authService.meOntime(function (res) {
      $scope.json = JSON.stringify(res, null, 4);
      $scope.loading = false;
    }, function (err) {
      toastr.error(err.message);
    });
  }
];