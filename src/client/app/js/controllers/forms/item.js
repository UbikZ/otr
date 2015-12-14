'use strict';

var toastr = require('toastr');
var recursiveTool = require('../../helpers/recursive');

module.exports = ['$rootScope', '$scope', 'identifier', 'organizationId', 'itemService', '$uibModalInstance',
  function ($rootScope, $scope, identifier, organizationId, itemService, $uibModalInstance) {
    $scope.identifier = identifier;
    $scope.organizationId = organizationId;
    $scope.isRoot = true;

    if (identifier) {
      itemService.get({id: organizationId}, function (res) {
        if (res.organizations.length != 1) {
          toastr.error('Error loading current item.');
        } else {
          var organization = res.organizations[0];
          recursiveTool.findRecursivelyById(organization, 'projects', identifier, function(element) {
            $scope.item = element;
          });
        }
        $scope.loading = false;
      }, function (err) {
        $scope.loading = false;
        toastr.error(err.message);
      });
    }

    $scope.submit = function (item) {
      $scope.loading = true;

      if ($scope.identifier) {
        item = Object.assign(item, {_id: $scope.identifier});
      }
      if ($scope.organizationId) {
        item = Object.assign(item, {organizationId: $scope.organizationId});
      }

      itemService.create(item, function (res) {
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