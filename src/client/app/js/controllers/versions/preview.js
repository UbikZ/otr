'use strict';

var $ = require('jquery');
var mappingSetting = require('../../helpers/mapping/setting');

module.exports = ['$scope', '$rootScope', '$stateParams', 'itemService', '$location',
  function ($scope, $rootScope, $stateParams, itemService, $location) {
    $scope.setting = {};

    itemService.get({
      organizationId: $stateParams.organizationId,
      itemId: $stateParams.itemId,
    }, function (res) {
      if (res.organization == undefined || res.item == undefined) {
        $location.path('/');
      } else {
        $scope.organization = res.organization;
        $scope.item = res.item;
        $scope.setting = mappingSetting.dalToDTO(res.item.settings[0]);
      }
    });

    $scope.toggleSetting = function () {
      $('.theme-config-box').toggleClass('show');
    };

    $scope.cost = function (id, depth, state) {

    };

    $scope.time = function (id) {

    };
  }
];