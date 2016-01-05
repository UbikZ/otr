'use strict';

var $ = require('jquery');
var mappingSetting = require('../../helpers/mapping/setting');
var computeEntry = require('../../helpers/computeEntry');


module.exports = ['$scope', '$rootScope', '$stateParams', 'itemService', 'settingService', '$location',
  function ($scope, $rootScope, $stateParams, itemService, settingService, $location) {
    var mainSetting = {};
    $scope.setting = {};

    $scope.submitSetting = function(setting) {
      $scope.loadingSubmitSetting = true;
      setting.organizationId = $scope.organization._id;
      setting.itemId = $scope.item._id;
      settingService.edit(setting, function (res) {
        $scope.loadingSubmitSetting = false;
        mainSetting = mappingSetting.dalToDTO(res.setting);
        $scope.setting = mappingSetting.dalToDTO(res.setting);
      });
    };

    $scope.restoreSetting = function() {
      $scope.setting = mainSetting;
    };

    itemService.get({
      organizationId: $stateParams.organizationId,
      itemId: $stateParams.itemId,
    }, function (res) {
      if (res.organization == undefined || res.item == undefined) {
        $location.path('/');
      } else {
        $scope.organization = res.organization;
        $scope.item = res.item;
        $scope.documentId = $stateParams.documentId;
        mainSetting = mappingSetting.dalToDTO(res.item.setting);
        $scope.setting = mappingSetting.dalToDTO(res.item.setting);

        /*
         * Base Functions
         */
        $scope.cost = function (id, _depth) {
          return computeEntry.walkElement($scope.item.entries, $scope.setting, id, _depth, computeEntry.const.PRICE);
        };
        $scope.time = function (id, _depth) {
          return computeEntry.walkElement($scope.item.entries, $scope.setting, id, _depth, computeEntry.const.TIME);
        };

        /*
         * Resume Functions
         */
        $scope.resumeTotalTasks = function() {
          return computeEntry.computeTotal($scope.item.entries, $scope.setting, computeEntry.const.TASKS);
        };
        $scope.resumeTotalEstims = function() {
          return computeEntry.computeTotal(
            $scope.item.entries,
            $scope.setting,
            computeEntry.const.ESTIM_DEV | computeEntry.const.ESTIM_SM
          );
        };
        $scope.resumeTotalEstimsDev = function() {
          return computeEntry.computeTotal($scope.item.entries, $scope.setting, computeEntry.const.ESTIM_DEV);
        };
        $scope.resumeTotalEstimsSM = function() {
          return computeEntry.computeTotal($scope.item.entries, $scope.setting, computeEntry.const.ESTIM_SM);
        };
        $scope.resumeTotalPriceDev = function() {
          return computeEntry.computeTotal($scope.item.entries, $scope.setting, computeEntry.const.ESTIM_DEV | computeEntry.const.PRICE);
        };
        $scope.resumeTotalPriceSM = function() {
          return computeEntry.computeTotal($scope.item.entries, $scope.setting, computeEntry.const.ESTIM_SM | computeEntry.const.PRICE);
        };
        $scope.resumeDayPerPersonPerIter = function() {
          return computeEntry.computeDayPerPersonPerIter($scope.item.entries, $scope.setting);
        };
        $scope.resumeIterations = function() {
          return computeEntry.interations($scope.item.entries, $scope.setting);
        }
      }
    });

    $scope.toggleSetting = function () {
      $('.theme-config-box').toggleClass('show');
      $('#document-element').toggleClass('col-lg-8');
    };
  }
];