'use strict';

var toastr = require('toastr');

module.exports = ['$scope', '$rootScope', 'organizationService',
  function ($scope, $rootScope, organizationService) {
    organizationService.get({}, function (res) {
      $scope.loading = false;
      $scope.users = res.users;
    }, function (err) {
      $scope.loading = false;
      toastr.error(err.message);
    });
  }
];