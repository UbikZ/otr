'use strict';

var $ = require('jquery');
var mappingSetting = require('../../helpers/mapping/setting');
var computeEntry = require('../../helpers/computeEntry');

module.exports = ['$scope', '$rootScope', '$stateParams', 'itemService', 'settingService', 'rendererService', '$location',
  function ($scope, $rootScope, $stateParams, itemService, settingService, rendererService, $location) {
    var mainSetting = {};
    $scope.setting = {};
    $scope.options = computeEntry.const;

    $scope.submitSetting = function(setting) {
      $scope.loadingSubmitSetting = true;
      setting.organizationId = $scope.organization._id;
      setting.itemId = $scope.item._id;
      settingService.edit(setting, function (res) {
        $scope.loadingSubmitSetting = false;
        mainSetting = mappingSetting.dalToDTO(res.setting);
        $scope.setting = mappingSetting.dalToDTO(res.setting);
        $scope.toggleSetting();
      });
    };

    $scope.restoreSetting = function() {
      $scope.setting = mainSetting;
    };

    $scope.download = function(args) {
      rendererService.renderPdf({});
    };

    itemService.get({
      organizationId: $stateParams.organizationId,
      itemId: $stateParams.itemId,
    }, function (res) {
      if (res.organization == undefined || res.item == undefined) {
        $location.path('/');
      } else {
        $rootScope.enableUi();
        $scope.organization = res.organization;
        $scope.item = res.item;
        $scope.documentId = $stateParams.documentId;
        mainSetting = mappingSetting.dalToDTO(res.item.setting);
        $scope.setting = mappingSetting.dalToDTO(res.item.setting);
        if ($rootScope.pdf.enabled == true) {
          $rootScope.pdf.loaded = true;
        }

        /*
         * Base Functions
         */
        $scope.cost = function (id, opts) {
          return computeEntry
            .walkElement($scope.item.entries, $scope.setting, id, computeEntry.const.PRICE | (opts || 0));
        };

        $scope.time = function (id, opts) {
          return computeEntry
            .walkElement($scope.item.entries, $scope.setting, id, computeEntry.const.TIME | (opts || 0));
        };

        /*
         * Resume Functions
         */
        $scope.resumeTotalTasks = function(opts) {
          return computeEntry.computeTotal($scope.item.entries, $scope.setting, computeEntry.const.TASKS | (opts || 0));
        };
        $scope.resumeTotalEstims = function(opts) {
          return computeEntry.computeTotal(
            $scope.item.entries,
            $scope.setting,
            computeEntry.const.ESTIM_DEV | computeEntry.const.ESTIM_SM | (opts || 0)
          );
        };
        $scope.resumeTotalEstimsDev = function(opts) {
          return computeEntry
            .computeTotal($scope.item.entries, $scope.setting, computeEntry.const.ESTIM_DEV | (opts || 0));
        };
        $scope.resumeTotalEstimsSM = function(opts) {
          return computeEntry
            .computeTotal($scope.item.entries, $scope.setting, computeEntry.const.ESTIM_SM | (opts || 0));
        };
        $scope.resumeTotalPriceDev = function(opts) {
          return computeEntry
            .computeTotal($scope.item.entries, $scope.setting, computeEntry.const.ESTIM_DEV | computeEntry.const.PRICE | (opts || 0));
        };
        $scope.resumeTotalPriceSM = function(opts) {
          return computeEntry
            .computeTotal($scope.item.entries, $scope.setting, computeEntry.const.ESTIM_SM | computeEntry.const.PRICE | (opts || 0));
        };
        $scope.resumeDayPerPersonPerIter = function(opts) {
          return computeEntry
            .computeDayPerPersonPerIter($scope.item.entries, $scope.setting);
        };
        $scope.resumeIterations = function(opts) {
          return computeEntry
            .iterations($scope.item.entries, $scope.setting, opts || 0);
        }
      }
    });

    $scope.toggleSetting = function () {
      $('.theme-config-box').toggleClass('show');
      $('#document-element').toggleClass('col-lg-8');
    };
  }
];