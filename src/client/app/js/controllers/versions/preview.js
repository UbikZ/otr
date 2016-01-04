'use strict';

var $ = require('jquery');
var mappingSetting = require('../../helpers/mapping/setting');
var computeEntry = require('../../helpers/computeEntry');


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
        $scope.documentId = $stateParams.documentId;
        $scope.setting = mappingSetting.dalToDTO(res.item.settings[0]);
      }
    });

    $scope.toggleSetting = function () {
      $('.theme-config-box').toggleClass('show');
      $('#document-element').toggleClass('col-lg-8');
    };

    /*
     * id: database _id
     * depth: depth in tree (2 levels max)
     */

    $scope.cost = function (id, _depth) {
      return computeEntry.walkElement($scope.item.entries, $scope.setting, id, _depth, true);
    };


    $scope.time = function (id, _depth) {
      return computeEntry.walkElement($scope.item.entries, $scope.setting, id, _depth);
    };
  }
];