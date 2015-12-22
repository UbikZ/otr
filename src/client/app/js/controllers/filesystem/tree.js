'use strict';

var toastr = require('toastr');
var recursiveTool = require('../../helpers/recursive');

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
        $scope.currentItem = $scope.organization;
        $scope.documents = [];
        $scope.projects = $scope.organization.projects;
      } else {
        recursiveTool.findRecursivelyById($scope.organization, 'projects', $scope.currentProjectIdNode, false,
          function (item) {
            $scope.currentItem = item;
            $scope.projects = item.projects;
            $scope.documents = item.documents;
          }
        );
        recursiveTool.findRecursivelyById($scope.items, 'children', id, false, function (element) {
          if (element._id === id) {
            $scope.currentItem = Object.assign($scope.currentItem, element);
            $scope.selected = element;
            $scope.expandedNodes.push(element);
          }
        }, true);
        $scope.breadcrumbElements =
          recursiveTool.findPathRecursivelyById($scope.items, $scope.currentProjectIdNode, 'children');
      }
    };

    $scope.$on('load-organization', function (event, data) {
      changeCurrentOrganization(data.organization);
      changeCurrentProjectIdNode();
      $scope.expandAll();
    });

    $scope.treeOptions = {
      nodeChildren: "children",
      dirSelectable: true,
    };

    /*
     * Modal edition
     */

    $scope.edit = function (objectId) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'views/partials/modal-item.html',
        controller: 'form.item.controller',
        resolve: {
          organizationId: function () {
            return $scope.organization._id;
          },
          identifier: function () {
            return {id: objectId, projectId: $scope.currentProjectIdNode};
          },
        }
      });

      modalInstance.result.then(function (res) {
        var orga = res.organization;
        var lastItem = res.item;
        changeCurrentOrganization(orga);
        if ($scope.currentProjectIdNode) {
          var currentIds = $scope[res.type].map(function (object) {
            return object._id;
          });
          var index = currentIds.indexOf(lastItem._id);
          if (index === -1) {
            $scope[res.type].push(lastItem);
          } else {
            $scope[res.type][index] = lastItem;
          }
          addExpandedNode(lastItem._id);
        } else {
          $scope.documents = orga.documents;
          $scope.projects = orga.projects;
        }
      });
    };

    $scope.delete = function (objectId) {
       itemService.delete(
        {organizationId: $scope.organization._id, itemId: objectId},
        function (res) {
          ['projects', 'documents'].forEach(function(itemType) {
            $scope[itemType].forEach(function (item, index) {
              if (item._id == res.item._id) {
                $scope[itemType].splice(index, 1);
              }
            });
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

    /*
     * Angular Control Tree actions
     */

    $scope.clearSelected = function () {
      $scope.selected = undefined;
      changeCurrentProjectIdNode();
      $scope.breadcrumbElements = [];
    };

    $scope.expandAll = function () {
      $scope.expandedNodes = [];
      $scope.items.forEach(function (item) {
        recursiveTool.walkTreeRecursively(item, 'children', 'project', function(element) {
          $scope.expandedNodes.push(element);
        });
      });
    };

    $scope.collapseAll = function () {
      $scope.expandedNodes = [];
    };

    $scope.open = function(idNode) {
      changeCurrentProjectIdNode(idNode);
    };

    $scope.onSelect = function (node, selected, $parentNode, $index) {
      var idNode;
      if (selected) {
          idNode = node._id;
      } else {
        idNode = undefined;
      }
      changeCurrentProjectIdNode(idNode);
    };

    function addExpandedNode(id) {
      recursiveTool.findRecursivelyById($scope.items, 'children', id, true, function (element) {
        $scope.expandedNodes = $scope.expandedNodes || [];
        if (element !== undefined) {
          $scope.expandedNodes.push(element);
        }
      }, true);
    }
  }
];