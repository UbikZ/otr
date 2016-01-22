'use strict';

var recursiveTool = require('../../../helpers/recursive');
var angular = require('angular');

module.exports = [
  '$rootScope', '$scope', 'identifier', 'organizationId', 'itemService', 'ontimeService', '$uibModalInstance',
  function ($rootScope, $scope, identifier, organizationId, itemService, ontimeService, $uibModalInstance) {
    $scope.identifier = identifier.id;
    $scope.isProject = identifier.parentId !== undefined;
    $scope.organizationId = organizationId;

    if ($scope.identifier) {
      itemService.get({organizationId: organizationId, itemId: $scope.identifier, lazy: 1}, function (res) {
        $scope.item = angular.extend({}, $scope.item || {}, res.item);
      });
    }

    if (identifier.isVersion === true) {
      $scope.refresh = function() {
        $scope.loadingOntime = true;
        $scope.loadingOntimeRelease = true;
        ontimeService.tree({}, function(res) {
          $scope.ontimeItems = res.tree;
          $scope.loadingOntime = false;
        });
        ontimeService.tree({idProject: 0}, function(res) {
          $scope.ontimeItemsRelease = res.tree;
          $scope.loadingOntimeRelease = false;
        });
      };

      if ($scope.identifier === undefined) {
        $scope.refresh();
      }

      $scope.selected = undefined;
      $scope.selectedRelease = undefined;
      $scope.treeOptions = {nodeChildren: 'children', dirSelectable: true};

      $scope.toggleSelect = function (node, selected) {
        $scope.loadingOntimeRelease = true;
        $scope.selected = selected ? node : undefined;
        ontimeService.tree({idProject: selected ? node.id : 0}, function(res) {
          $scope.ontimeItemsRelease = res.tree;
          $scope.loadingOntimeRelease = false;
        });
      };

      $scope.toggleSelectRelease = function (node, selected) {
        $scope.selectedRelease = selected ? node : undefined;
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

      $scope.expandReleaseAll = function () {
        $scope.expandedNodesRelease = [];
        $scope.ontimeItemsRelease.forEach(function (item) {
          recursiveTool.walkTreeRecursively(item, 'children', 'project', function (element) {
            $scope.expandedNodesRelease.push(element);
          });
        });
      };

      $scope.collapseReleaseAll = function () {
        $scope.expandedNodesRelease = [];
      };
    }

    $scope.submit = function (item) {
      $scope.loading = true;
      if ($scope.identifier === undefined) {
        item.ontimeId = $scope.selected.id || $scope.selectedRelease.id;
      }

      if ($scope.organizationId) {
        item = Object.assign(item, {organizationId: $scope.organizationId});
      }
      if (item._id === undefined) {
        if (identifier.parentId) {
          item = Object.assign(item, {parentId: identifier.parentId});
        }
        if (identifier.isVersion === true) {
          item.setting = identifier.setting;
        }
      }
      if (identifier.isVersion === true) {
        item.entries = {};
      }
      item.lazy = 1;

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