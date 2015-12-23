'use strict';

var toastr = require('toastr');
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
      }, function (err) {
        toastr.error(err.message);
      });
    }

    angular.extend($scope.setting, {parent: identifier.parent});

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