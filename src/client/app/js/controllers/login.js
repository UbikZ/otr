'use strict';

module.exports = ['$scope', '$rootScope', 'authService', '$location', '$localStorage',
  function ($scope, $rootScope, authService, $location, $localStorage) {
    $scope.loading = false;

    $scope.login = function (user) {
      $scope.loading = true;
      authService.login(user, function (res) {
        $scope.loading = false;
        $localStorage.token = res.user.identity.token;
        $localStorage.ot_token = res.user.identity.ontime_token;
        $rootScope.user = res.user;
        $rootScope.isAuthenticated = true;
        $location.path('/');
      });
    };
  }
];