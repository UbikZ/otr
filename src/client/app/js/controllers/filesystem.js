'use strict';

var toastr = require('toastr');
var recursiveTool = require('../helpers/recursive');

module.exports = ['$scope', '$rootScope', 'organizationService', 'itemService', '$uibModal', '$timeout',
  function ($scope, $rootScope, organizationService, itemService, $uibModal, $timeout) {

    $scope.organization = organizationService.getCurrentOrganization();
    $scope.$watch('organization', function () {
      $timeout(function () {
        if ($scope.organization != undefined) {
          $scope.items = recursiveTool.convertTreeView($scope.organization);
        }
      }, 0, false);
    });

    $scope.currentProjectIdNode = undefined;
    var onCurrentProjectIdNodeChange = function () {
        if ($scope.currentProjectIdNode == undefined) {
          $scope.documents = $scope.organization.documents;
          $scope.projects = $scope.organization.projects;
        } else {
          recursiveTool.findRecursivelyById($scope.organization, 'projects', $scope.currentProjectIdNode,
            function (item) {
              $scope.projects = item.projects;
            }
          );
        }
    };
    onCurrentProjectIdNodeChange();

    $scope.documents = $scope.organization.documents;
    $scope.projects = $scope.organization.projects;

    $scope.treeOptions = {
      nodeChildren: "children",
      dirSelectable: true,
    };

    $scope.onSelect = function (node, selected, $parentNode, $index) {
      if (selected) {
        if (node.type == 'project') {
          $scope.currentProjectIdNode = node.id;
        } else if (node.type == 'document') {
          $scope.currentProjectIdNode = $parentNode.id;
        }
      } else {
        $scope.currentProjectIdNode = undefined;
      }
      onCurrentProjectIdNodeChange();
    };

    $scope.edit = function (objectId, type) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'views/partials/modal-item.html',
        controller: 'form.item.controller',
        resolve: {
          organizationId: function () {
            return $scope.organization._id;
          },
          identifier: function () {
            return {id: objectId, type: type};
          },
        }
      });

      modalInstance.result.then(function (orga) {
        $scope.organization = orga;
        if (objectId) {
          var itemType = type == undefined ? 'projects' : 'documents';
          recursiveTool.findRecursivelyById($scope.organization, itemType, objectId, function (item) {
            $scope[itemType].forEach(function (itemToUpdate, index) {
              if (itemToUpdate._id === item._id) {
                $scope[itemType][index] = item;
              }
            });
          });
        } else {
          $scope.documents = orga.documents;
          $scope.projects = orga.projects;
        }
      });
    };

    $scope.delete = function (objectId, type) {
      var data = Object.assign(
        {organizationId: $scope.organization._id},
        type == 'document' ? {documentId: objectId} : {projectId: objectId}
      );

      itemService.delete(data,
        function (res) {
          var itemType = type == undefined ? 'projects' : 'documents';
          recursiveTool.removeRecursivelyById($scope.organization, itemType, objectId, function (items) {
            $scope[itemType] = items;
          });
          $scope.organization = res.organization;
          // todo: can't update without this...
          $scope.items = recursiveTool.convertTreeView($scope.organization);
        }, function (err) {
          toastr.error(err.message);
        }
      );
    };
  }
];