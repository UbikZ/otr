'use strict';

var mappingSetting = require('../../../helpers/mapping/setting');

module.exports = ['$rootScope', '$scope', 'settingService', '_CONST',
  function ($rootScope, $scope, settingService, _CONST) {
    $scope.loading = false;

    // we have set our ONLY item with id 42 (we don't need more, others will be subdocuments)
    settingService.get({id: _CONST.DATAMODEL.ID_SETTING}, function (res) {
      $scope.loading = false;
      $rootScope.enableUi();
      if (res.setting !== undefined) {
        $scope.setting = mappingSetting.dalToDTO(res.setting);
      } else {
        $scope.setting = {};
      }
    });

    $scope.update = function (setting) {
      $scope.loading = true;
      settingService.update(setting, function (res) {
        $scope.setting = mappingSetting.dalToDTO(res.setting);
        $scope.loading = false;
      });
    };
  }
];