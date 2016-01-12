'use strict';

module.exports = ['$rootScope', '$scope', 'identifier', 'organizationService', '$uibModalInstance',
  function ($rootScope, $scope, identifier, organizationService, $uibModalInstance) {
    $scope.identifier = identifier;

    if (identifier) {
      organizationService.get({id: identifier, lazy:1}, function (res) {
        $scope.organization = res.organizations[0];
      });
    }

    $scope.submit = function (organization) {
      $scope.loading = true;
      if ($scope.identifier) {
        organization = Object.assign(organization, {_id: $scope.identifier, lazy:1});
      }
      organizationService.update(organization, function (res) {
        $scope.loading = false;
        $uibModalInstance.close(res.organization);
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
];