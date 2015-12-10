'use strict';

var toastr = require('toastr');

module.exports = ['$scope', '$rootScope', 'organizationService', '$uibModal',
  function ($scope, $rootScope, organizationService, $uibModal) {
    $scope.loading = true;

    organizationService.get({}, function (res) {
      $scope.loading = false;
      $scope.organizations = res.organizations;
    }, function (err) {
      $scope.loading = false;
      toastr.error(err.message);
    });

    $scope.open = function(objectId) {
      $uibModal.open({
        animation: true,
        templateUrl: 'views/partials/modal-organization.html',
        controller: 'form.organization.controller',
        resolve: {
          identifier: function() { return objectId; },
        }
      });
    }
  }
];