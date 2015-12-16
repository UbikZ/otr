'use strict';

var toastr = require('toastr');
var recursiveTool = require('../helpers/recursive');

module.exports = ['$scope', '$rootScope', 'itemService', '$uibModal',
  function ($scope, $rootScope, itemService, $uibModal) {

    var changeCurrentOrganization = function (organization) {
      $scope.organization = organization;
      if ($scope.organization != undefined) {
        $scope.items = recursiveTool.convertTreeView($scope.organization);
      }
    };
    var changeCurrentProjectIdNode = function (id) {
      $scope.currentProjectIdNode = id;
      if ($scope.currentProjectIdNode == undefined) {
        $scope.documents = [];
        $scope.projects = $scope.organization.projects;
      } else {
        recursiveTool.findRecursivelyById($scope.organization, 'projects', $scope.currentProjectIdNode, false,
          function (item) {
            $scope.projects = item.projects;
          }
        );
      }
    };

    $scope.$on('load-organization', function (event, data) {
      changeCurrentOrganization(data.organization);
      changeCurrentProjectIdNode();
    });

    $scope.treeOptions = {
      nodeChildren: "children",
      dirSelectable: true,
    };

    $scope.onSelect = function (node, selected, $parentNode, $index) {
      var idNode;
      if (selected) {
        if (node.type == 'project') {
          idNode = node._id;
        } else if (node.type == 'document') {
          idNode = $parentNode._id;
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

      modalInstance.result.then(function (res) {
        var orga = res.organization;
        var lastItem = res.item;
        changeCurrentOrganization(orga);
        if ($scope.currentProjectIdNode) {
          var itemType = type == undefined ? 'projects' : 'documents';
          var currentIds = $scope[itemType].map(function (object) {
            return object._id;
          });
          var index = currentIds.indexOf(lastItem._id);
          if (index === -1) {
            $scope[itemType].push(lastItem);
          } else {
            $scope[itemType][index] = lastItem;
          }
          addExpandedNode(lastItem._id);
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
          $scope[itemType].forEach(function (item, index) {
            if (item._id == res.item._id) {
              $scope[itemType].splice(index, 1);
            }
          });
          changeCurrentOrganization(res.organization);
        }, function (err) {
          toastr.error(err.message);
        }
      );
    };

    $scope.toggleDropdown = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = !$scope.opened;
    };

    function addExpandedNode(id) {
      recursiveTool.findRecursivelyById($scope.items, 'children', id, true, function (element) {
        if (element !== undefined) {
          $scope.expandedNodes.push(element);
        }
      }, true);
    }
  }
];