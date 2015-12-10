'use strict';

module.exports = ['$scope', '$rootScope', 'userService',
  function ($scope, $rootScope, userService) {
    userService.get({}, function (res) {
      $scope.loading = false;
      $scope.users = res.users;
    }, function (err) {
      $scope.loading = false;
      toastr.error(err.message);
    });
  }
];