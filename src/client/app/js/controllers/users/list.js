'use strict';

module.exports = ['$scope', '$rootScope', 'userService',
  function ($scope, $rootScope, userService) {
    $scope.loading = true;

    userService.get({}, function (res) {
      $rootScope.enableUi();
      $scope.loading = false;
      $scope.users = res.users;
    });
  }
];