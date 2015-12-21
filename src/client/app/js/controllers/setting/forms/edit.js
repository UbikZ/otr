'use strict';

var toastr = require('toastr');

module.exports = ['$rootScope', '$scope', 'settingService',
  function ($rootScope, $scope, settingService) {
    $scope.loading = false;

    // we have set our ONLY item with id 42 (we don't need more, others will be subdocuments)
    settingService.get({id: 42}, function (res) {
      $scope.loading = false;
      if (res.setting != undefined) {
        $scope.setting = parse(res.setting);
      }
    }, function (err) {
      $scope.loading = false;
      toastr.error(err.message);
    });

    $scope.update = function (setting) {
      $scope.loading = true;
      settingService.update(setting, function (res) {
        $scope.setting = parse(res.setting);
        $scope.loading = false;
      }, function (err) {
        $scope.loading = false;
        toastr.error(err.message);
      });
    };

    function parse(setting) {
      return {
        id: setting.id,
        contributorPrice: setting.project_dev.contributor_price,
        contributorOccupation: setting.project_dev.contributor_occupation,
        scrummasterPrice: setting.project_management.scrummaster_price,
        scrummasterOccupation: setting.project_management.scrummaster_occupation,
        rateMultiplier: setting.billing.rate_multiplier,
        showDev: setting.billing.show_dev_price,
        showManagement: setting.billing.show_management_price,
        estimateType: setting.unit.estimate_type,
        rangeEstimateUnit: setting.unit.range_estimate_unit,
        label: setting.unit.label,
        showDate: setting.date.show,
        contributorAvailable: setting.iteration.contributor_available,
        hourPerDay: setting.iteration.hour_per_day,
        dayPerWeek: setting.iteration.day_per_week,
        weekPerIteration: setting.iteration.week_per_iteration,
      };
    };
  }
];