'use strict';

var toastr = require('toastr');
var recursiveTool = require('../../helpers/recursive');

module.exports = ['$rootScope', '$scope', 'identifier', 'organizationId', 'itemService', '$uibModalInstance',
  function ($rootScope, $scope, identifier, organizationId, itemService, $uibModalInstance) {
    $scope.identifier = identifier.id;
    $scope.organizationId = organizationId;
    $scope.isRoot = true;

    if ($scope.identifier) {
      itemService.get({id: organizationId}, function (res) {
        if (res.organizations.length != 1) {
          toastr.error('Error loading current item.');
        } else {
          var organization = res.organizations[0];
          var itemType = identifier.type == undefined ? 'projects' : 'documents';
          recursiveTool.findRecursivelyById(organization, itemType, $scope.identifier, function(element) {
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
        if (identifier.type == 'document') {
          item = Object.assign(item, {documentId: $scope.identifier});
        } else {
          item = Object.assign(item, {projectId: $scope.identifier});
        }
      }
      if ($scope.organizationId) {
        item = Object.assign(item, {organizationId: $scope.organizationId});
      }

      itemService.edit(item, function (res) {
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