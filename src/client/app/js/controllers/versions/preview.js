'use strict';

module.exports = ['$scope', '$rootScope', '$stateParams', 'itemService',
  function ($scope, $rootScope, $stateParams, itemService, $uibModal) {
    itemService.get({
      organizationId: $stateParams.organizationId,
      itemId: $stateParams.itemId,
    }, function (res) {
      console.log(res.organization);
      console.log(res.item);
    });
  }
];