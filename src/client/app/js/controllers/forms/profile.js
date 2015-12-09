'use strict';

var toastr = require('toastr');

module.exports = ['$rootScope', '$scope', '$localStorage', 'userService',
  function ($rootScope, $scope, $localStorage, userService) {
    $scope.loading = false;

    $scope.profile = {
      firstname: $rootScope.user.name.firstname,
      lastname: $rootScope.user.name.lastname,
      job: $rootScope.user.info.job,
    };

    $scope.update = function (profile) {
      $scope.loading = true;
      userService.update(profile, function (res) {
        $rootScope.user = res.user;
        $localStorage.user = JSON.stringify($rootScope.user);
        $scope.loading = false;
      }, function (err) {
        $scope.loading = false;
        toastr.error(err.message);
      });
    }
  }
];