'use strict';

var toastr = require('toastr');
var mappingSetting = require('../../../helpers/mapping/setting');
var recursiveTool = require('../../../helpers/recursive');

module.exports = ['$rootScope', '$scope', 'identifier', 'organizationId', 'settingService', '$uibModalInstance',
  function ($rootScope, $scope, identifier, organizationId, settingService, $uibModalInstance) {
    $scope.identifier = identifier.id;
    $scope.organizationId = organizationId;

    if ($scope.identifier) {
      settingService.getSub({organizationId: organizationId, itemId: $scope.identifier}, function (res) {
        if (res.setting != undefined) {
          $scope.setting = mappingSetting.dalToDTO(res.setting);
        } else {
          toastr.error('Error loading current item.');
        }
      }, function (err) {
        toastr.error(err.message);
      });
    }

    $scope.submit = function (setting) {
      $scope.loading = true;

      if ($scope.organizationId) {
        setting = Object.assign(setting, {organizationId: $scope.organizationId});
      }
      if ($scope.identifier) {
        setting = Object.assign(setting, {itemId: $scope.identifier});
      }

      settingService.edit(setting, function (res) {
        $scope.loading = false;
        $uibModalInstance.close({organization: res.organization, setting: res.setting});
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