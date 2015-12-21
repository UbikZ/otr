'use strict';

var toastr = require('toastr');

module.exports = ['$rootScope', '$scope', 'identifier', 'organizationService', '$uibModalInstance',
  function ($rootScope, $scope, identifier, organizationService, $uibModalInstance) {
    $scope.identifier = identifier;

    if (identifier) {
      organizationService.get({id: identifier}, function (res) {
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

    $scope.submit = function (organization) {
      $scope.loading = true;
      if ($scope.identifier) {
        organization = Object.assign(organization, {_id: $scope.identifier});
      }
      organizationService.update(organization, function (res) {
        $scope.loading = false;
        $uibModalInstance.close(res.organization);
      }, function (err) {
        $scope.loading = false;
        toastr.error(err.message);
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
];