'use strict';

var toastr = require('toastr');
var recursiveTool = require('../helpers/recursive');

module.exports = ['$scope', '$rootScope', 'organizationService', 'itemService', '$uibModal', '$timeout',
  function ($scope, $rootScope, organizationService, itemService, $uibModal, $timeout) {

    var changeCurrentOrganization = function (organization) {
      $scope.organization = organization;
      if ($scope.organization != undefined) {
        $scope.items = recursiveTool.convertTreeView($scope.organization);
      }
    };
    changeCurrentOrganization(organizationService.getCurrentOrganization());

    var changeCurrentProjectIdNode = function (id) {
      $scope.currentProjectIdNode = id;
      if ($scope.currentProjectIdNode == undefined) {
        $scope.documents = [];
        $scope.projects = $scope.organization.projects;
      } else {
        recursiveTool.findRecursivelyById($scope.organization, 'projects', $scope.currentProjectIdNode,
          function (item) {
            $scope.projects = item.projects;
          }
        );
      }
    };
    changeCurrentProjectIdNode();

    $scope.treeOptions = {
      nodeChildren: "children",
      dirSelectable: true,
    };

    $scope.onSelect = function (node, selected, $parentNode, $index) {
      var idNode;
      if (selected) {
        if (node.type == 'project') {
          idNode = node.id;
        } else if (node.type == 'document') {
          idNode = $parentNode.id;
        }
      } else {
        idNode = undefined;
      }
      changeCurrentProjectIdNode(idNode);
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
            return {id: objectId, projectId: $scope.currentProjectIdNode, type: type};
          },
        }
      });

      modalInstance.result.then(function (orga) {
        changeCurrentOrganization(orga);
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
            $scope[itemType] = items[itemType];
          });
          changeCurrentOrganization(res.organization);
        }, function (err) {
          toastr.error(err.message);
        }
      );
    };
  }
];