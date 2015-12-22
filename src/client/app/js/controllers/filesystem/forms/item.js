'use strict';

var toastr = require('toastr');

module.exports = ['$rootScope', '$scope', 'identifier', 'organizationId', 'itemService', '$uibModalInstance',
  function ($rootScope, $scope, identifier, organizationId, itemService, $uibModalInstance) {
    $scope.identifier = identifier.id;
    $scope.isProject = identifier.projectId !== undefined;
    $scope.organizationId = organizationId;

    if ($scope.identifier) {
      itemService.get({organizationId: organizationId, itemId: $scope.identifier}, function (res) {
        if (res.item != undefined) {
          $scope.item = res.item;
        } else {
          toastr.error('Error loading current item.');
        }
        $scope.loading = false;
      }, function (err) {
        $scope.loading = false;
        toastr.error(err.message);
      });
    }

    $scope.submit = function (item) {
      $scope.loading = true;

      if ($scope.organizationId) {
        item = Object.assign(item, {organizationId: $scope.organizationId});
      }
      if (item._id == undefined) {
        if (identifier.projectId) {
          item = Object.assign(item, {projectId: identifier.projectId});
        }
      }

      itemService.edit(item, function (res) {
        $scope.loading = false;
        $uibModalInstance.close({organization: res.organization, item: res.item, type: res.type});
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