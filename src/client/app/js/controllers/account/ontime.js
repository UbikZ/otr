'use strict';

module.exports = ['$scope', '$rootScope', 'ontimeService',
  function ($scope, $rootScope, ontimeService) {
    $scope.loading = true;
    $scope.json = undefined;
    ontimeService.meOntime({}, function (res) {
      $rootScope.enableUi();
      $scope.json = JSON.stringify(res, null, 4);
      $scope.loading = false;
    });
  }
];