'use strict';

module.exports = ['$rootScope', '$scope', 'identifier', 'organizationId', 'itemService', '$uibModalInstance',
  function ($rootScope, $scope, identifier, organizationId, itemService, $uibModalInstance) {
    $scope.identifier = identifier.id;
    $scope.isProject = identifier.parentId !== undefined;
    $scope.organizationId = organizationId;

    if ($scope.identifier) {
      itemService.get({organizationId: organizationId, itemId: $scope.identifier}, function (res) {
        $scope.item = res.item;
      });
    }

    $scope.submit = function (item) {
      $scope.loading = true;

      if ($scope.organizationId) {
        item = Object.assign(item, {organizationId: $scope.organizationId});
      }
      if (item._id == undefined) {
        if (identifier.parentId) {
          item = Object.assign(item, {parentId: identifier.parentId});
        }
      }

      itemService.edit(item, function (res) {
        $scope.loading = false;
        $uibModalInstance.close({organization: res.organization, item: res.item, type: res.type});
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
];