'use strict';

var recursiveTool = require('../../../helpers/recursive');
var angular = require('angular');

module.exports = ['$rootScope', '$scope', 'identifier', 'organizationId', 'itemService', 'ontimeService', '$uibModalInstance',
  function ($rootScope, $scope, identifier, organizationId, itemService, ontimeService, $uibModalInstance) {
    $scope.identifier = identifier.id;
    $scope.isProject = identifier.parentId !== undefined;
    $scope.organizationId = organizationId;

    if ($scope.identifier) {
      itemService.get({organizationId: organizationId, itemId: $scope.identifier}, function (res) {
        $scope.item = angular.extend({}, $scope.item || {}, res.item);
      });
    }

    if (identifier.isVersion === true) {
      $scope.refresh = function() {
        $scope.loadingOntime = true;
        ontimeService.tree({}, function(res) {
          $scope.ontimeItems = res.tree;
          $scope.loadingOntime = false;
        });
      };

      if ($scope.identifier == undefined) {
        $scope.refresh();
      }

      $scope.selected = undefined;
      $scope.treeOptions = {
        nodeChildren: "children",
        dirSelectable: true,
      };

      $scope.onSelect = function (node, selected, $parentNode, $index) {
        if (selected) {
          $scope.selected = node;
          $scope.item.ontimeId = node.id;
        } else {
          $scope.selected = undefined;
          $scope.item.ontimeId = undefined;
        }
      };

      $scope.expandAll = function () {
        $scope.expandedNodes = [];
        $scope.ontimeItems.forEach(function (item) {
          recursiveTool.walkTreeRecursively(item, 'children', 'project', function (element) {
            $scope.expandedNodes.push(element);
          });
        });
      };

      $scope.collapseAll = function () {
        $scope.expandedNodes = [];
      };
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
      if (identifier.isVersion === true) {
        item.entries = {};
      }

      itemService.edit(item, function (res) {
        $scope.loading = false;
        $uibModalInstance.close({organization: res.organization, item: res.item, type: res.type});
      }, function() {
        $scope.loading = false;
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
];