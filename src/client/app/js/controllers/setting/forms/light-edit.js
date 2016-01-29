'use strict';

var mappingSetting = require('../../../helpers/mapping/setting');
var angular = require('angular');

module.exports = ['$rootScope', '$scope', 'identifier', 'organizationId', 'settingService', '$uibModalInstance',
  function ($rootScope, $scope, identifier, organizationId, settingService, $uibModalInstance) {
    $scope.identifier = identifier.id;
    $scope.setting = {};
    $scope.organizationId = organizationId;

    if ($scope.identifier) {
      settingService.getSub({organizationId: organizationId, itemId: $scope.identifier}, function (res) {
        angular.extend($scope.setting, mappingSetting.dalToDTO(res.setting));
      });
    }

    angular.extend($scope.setting, {parent: identifier.parent});

    // Default value for checkboxes / select
    ['showDev', 'showManagement', 'showDate', 'estimateType', 'rangeEstimateUnit'].forEach(function (item) {
      if ($scope.setting[item] === undefined && identifier.parent !== undefined) {
        $scope.setting[item] = identifier.parent[item];
      }
    });

    $scope.submit = function (setting) {
      $scope.loading = true;

      if ($scope.organizationId) {
        setting = Object.assign(setting, {organizationId: $scope.organizationId});
      }
      if ($scope.identifier) {
        setting = Object.assign(setting, {itemId: $scope.identifier});
      }
      setting.lazy = 1;

      settingService.edit(setting, function (res) {
        $scope.loading = false;
        $uibModalInstance.close({organization: res.organization, setting: res.setting});
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
];