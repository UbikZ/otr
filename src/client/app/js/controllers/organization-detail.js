'use strict';

var toastr = require('toastr');

module.exports = ['$scope', '$rootScope', '$stateParams', 'organizationService',
  function ($scope, $rootScope, $stateParams, organizationService) {
    organizationService.get({id: $stateParams.id}, function (res) {
      if (res.organizations.length != 1) {
        toastr.error('Error loading current organization.');
      } else {
        $scope.organization = res.organizations[0];
      }
      $scope.loading = false;
    }, function (err) {
      $scope.loading = false;
      toastr.error(err.message);
    });
  }
];