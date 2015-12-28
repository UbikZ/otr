'use strict';

module.exports = ['$rootScope', '$scope', 'identifier', 'organizationService', '$uibModalInstance',
  function ($rootScope, $scope, identifier, organizationService, $uibModalInstance) {
    $scope.identifier = identifier;

    if (identifier) {
      organizationService.get({id: identifier}, function (res) {
        $scope.organization = res.organizations[0];
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
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
];