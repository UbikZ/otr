'use strict';

var toastr = require('toastr');

module.exports = ['$rootScope', '$scope', '$localStorage', 'userService',
  function ($rootScope, $scope, $localStorage, userService) {
    $scope.loading = false;

    $scope.settings = {
      contributorPrice: 650,
      contributorOccupation: 80,
      scrummasterPrice: 900,
      scrummasterOccupation: 200,
      rateMultiplier: 140,
      showDev: true,
      showManagement: true,
      estimateType: 'final',
      rangeEstimateUnit: null,
      label: 'jr/h',
      showDate: true,
      contributorAvailable: 1,
      hourPerDay: 8,
      dayPerWeek: 5,
      weekPerIteration: 2,
    };

    $scope.update = function (settings) {
      $scope.loading = true;
      console.log(settings);
      // todo

    }
  }
];