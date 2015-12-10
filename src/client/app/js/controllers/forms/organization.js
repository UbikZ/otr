'use strict';

var toastr = require('toastr');

module.exports = ['$rootScope', '$scope', 'identifier', 'organizationService', '$uibModalInstance',
  function ($rootScope, $scope, identifier, organizationService, $uibModalInstance) {
    $scope.identifier = identifier;

    $scope.organization = {

    };

    $scope.submit = function (organization) {
      $scope.loading = true;
      if ($scope.identifier) {
        organization = Object.assign(organization, {_id: $scope.identifier});
      }
      organizationService.update(organization, function (res) {
        console.log(res);
        $scope.loading = false;
        $uibModalInstance.close();
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