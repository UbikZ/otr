'use strict';

module.exports = ['$scope', '$rootScope', '$stateParams', 'itemService', '$location'
  function ($scope, $rootScope, $stateParams, itemService, $location) {
    itemService.get({
      organizationId: $stateParams.organizationId,
      itemId: $stateParams.itemId,
    }, function (res) {
      if (res.organization == undefined || res.item == undefined) {
        $location.path('/');
      } else {
        console.log(res.organization);
        console.log(res.item);
      }
    });
  }
];