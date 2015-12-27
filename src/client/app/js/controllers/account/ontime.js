'use strict';

module.exports = ['$scope', '$rootScope', 'authService',
  function ($scope, $rootScope, authService) {
    $scope.loading = true;
    $scope.json = undefined;
    authService.meOntime(function (res) {
      $scope.json = JSON.stringify(res, null, 4);
      $scope.loading = false;
    });
  }
];