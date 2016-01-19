'use strict';

var recursiveTool = require('../../helpers/recursive');
var mappingSetting = require('../../helpers/mapping/setting');
var angular = require('angular');

module.exports = ['$scope', '$rootScope', 'itemService', 'settingService', '$uibModal', '$location', '_CONST',
  function ($scope, $rootScope, itemService, settingService, $uibModal, $location, _CONST) {

    function changeCurrentOrganization(organization) {
      $scope.organization = organization;
      if ($scope.organization !== undefined) {
        $scope.items = recursiveTool.convertTreeView($scope.organization);
      }
    }

    function mergeFileItems() {
      $scope.fileItems = [];
      if ($scope.projects !== undefined) {
        $scope.fileItems = $scope.fileItems.concat($scope.projects);
      }
      if ($scope.documents !== undefined) {
        $scope.fileItems = $scope.fileItems.concat($scope.documents);
      }
    }

    function mergeSettings() {
      var parentSetting, finalSetting;
      finalSetting = parentSetting = $scope.masterSetting;
      if (finalSetting !== undefined) {
        parentSetting = finalSetting =
          angular.extend({}, finalSetting, mappingSetting.dalToDTO($scope.organization.setting));
        if ($scope.breadcrumbElements !== undefined) {
          $scope.breadcrumbElements.forEach(function (element, index) {
            if (index < $scope.breadcrumbElements.length - 1) {
              parentSetting = angular.extend({}, parentSetting, mappingSetting.dalToDTO(element.setting));
            }
            finalSetting = angular.extend({}, finalSetting, mappingSetting.dalToDTO(element.setting));
          });
        } else {
          parentSetting = $scope.masterSetting;
        }
      }

      $scope.parentSetting = parentSetting;
      $scope.setting = finalSetting;
    }

    function changeCurrentIdNode(id) {
      $scope.currentIdNode = id;
      $scope.expandedNodes = $scope.expandedNodes || [];
      $location.hash(id === undefined ? '_' : $scope.currentIdNode);
      if ($scope.currentIdNode === undefined) {
        $scope.breadcrumbElements = undefined;
        $scope.currentItem = $scope.organization;
        $scope.documents = [];
        $scope.projects = $scope.organization.projects;
      } else {
        recursiveTool.findSpecificRecursivelyById($scope.organization, $scope.currentIdNode, function (item) {
          $scope.currentItem = item;
          $scope.projects = item.projects;
          $scope.documents = item.documents;
        });
        recursiveTool.findRecursivelyById($scope.items, 'children', id, false, function (element) {
          if (element._id === id) {
            $scope.currentItem.type = element.type;
            if ($scope.currentItem.type === 'document') {
              $scope.versions = $scope.currentItem.versions;
            }
            $scope.selected = element;
            $scope.expandedNodes.push(element);
          }
        }, true);
        $scope.breadcrumbElements =
          recursiveTool.findPathRecursivelyById($scope.items, $scope.currentIdNode, 'children');
      }
      mergeSettings();
      $scope.$broadcast('load-fs-current-item', {currentItem: $scope.currentItem});
      mergeFileItems();
    }

    function loadCurrentSetting() {
      if ($scope.masterSetting === undefined) {
        settingService.get({id: _CONST.DATAMODEL.ID_SETTING}, function (res) {
          if (res.setting !== undefined) {
            $scope.masterSetting = mappingSetting.dalToDTO(res.setting);
            if ($scope.organization.setting === undefined) {
              $scope.setting = $scope.masterSetting;
            }
            mergeSettings();
          }
        });
      }
    }

    $scope.$on('load-organization', function (event, data) {
      changeCurrentOrganization(data.organization);
      changeCurrentIdNode(~['', '_'].indexOf($location.hash()) ? undefined : $location.hash());
      loadCurrentSetting();
      $scope.expandAll();
    });

    $scope.treeOptions = {nodeChildren: 'children', dirSelectable: true};

    /*
     * Angular Control Tree actions
     */

    $scope.clearSelected = function () {
      $scope.selected = undefined;
      changeCurrentIdNode();
      $scope.breadcrumbElements = [];
    };

    $scope.expandAll = function () {
      $scope.expandedNodes = [];
      $scope.items.forEach(function (item) {
        recursiveTool.walkTreeRecursively(item, 'children', 'project', function (element) {
          $scope.expandedNodes.push(element);
        });
      });
    };

    $scope.collapseAll = function () {
      $scope.expandedNodes = [];
    };

    $scope.open = function (idNode) {
      changeCurrentIdNode(idNode);
    };

    $scope.onSelect = function (node, selected) {
      var idNode;
      if (selected) {
        idNode = node._id;
      } else {
        idNode = undefined;
      }
      changeCurrentIdNode(idNode);
    };

    function addExpandedNode(id) {
      $scope.expandedNodes = $scope.expandedNodes || [];
      var expendedIds = $scope.expandedNodes.map(function (obj) {
        return obj._id;
      });
      recursiveTool.findRecursivelyById($scope.items, 'children', id, true, function (element) {
        if (element !== undefined && expendedIds.indexOf(element._id) === -1) {
          $scope.expandedNodes.push(element);
        }
      }, true);
    }

    /*
     * Modal Setting Edition
     */

    $scope.editSetting = function (objectId) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'partials/modal-setting.html',
        controller: 'form.light-setting.controller',
        resolve: {
          organizationId: function () {
            return $scope.organization._id;
          },
          identifier: function () {
            return {id: objectId, parent: $scope.parentSetting};
          },
        }
      });

      modalInstance.result.then(function (res) {
        var orga = res.organization;
        changeCurrentOrganization(orga);
        changeCurrentIdNode(objectId);
      });
    };

    /*
     * Modal Version Edition
     */

    $scope.editVersion = function (objectId) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'partials/modal-version.html',
        controller: 'form.item.controller',
        resolve: {
          organizationId: function () {
            return $scope.organization._id;
          },
          identifier: function () {
            return {id: objectId, parentId: $scope.currentIdNode, setting: $scope.setting, isVersion: true};
          },
        }
      });

      modalInstance.result.then(function (res) {
        var orga = res.organization;
        var lastItem = res.item;
        changeCurrentOrganization(orga);
        var currentIds = $scope.versions.map(function (object) {
          return object._id;
        });
        var index = currentIds.indexOf(lastItem._id);
        if (index === -1) {
          $scope.versions.push(lastItem);
        } else {
          $scope.versions[index] = lastItem;
        }
      });
    };

    /*
     * Modal Item Edition
     */

    $scope.editItem = function (objectId) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'partials/modal-item.html',
        controller: 'form.item.controller',
        resolve: {
          organizationId: function () {
            return $scope.organization._id;
          },
          identifier: function () {
            return {id: objectId, parentId: $scope.currentIdNode};
          },
        }
      });

      modalInstance.result.then(function (res) {
        var orga = res.organization;
        var lastItem = res.item;
        changeCurrentOrganization(orga);
        if ($scope.currentIdNode) {
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
          $scope.expandAll();
        }
        mergeFileItems();
      });
    };

    $scope.delete = function (objectId) {
      itemService.delete(
        {organizationId: $scope.organization._id, itemId: objectId},
        function (res) {
          ['projects', 'documents', 'versions'].forEach(function (itemType) {
            var elements = $scope[itemType] || [];
            elements.forEach(function (item, index) {
              if (item._id === objectId) {
                $scope[itemType].splice(index, 1);
              }
            });
          });
          changeCurrentOrganization(res.organization);
          mergeFileItems();
        }
      );
    };

    $scope.toggleDropdown = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = !$scope.opened;
    };
  }
];