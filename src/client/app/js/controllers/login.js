'use strict';

module.exports = ['$scope', '$rootScope', 'authService', '$location', '$localStorage',
  function ($scope, $rootScope, authService, $location, $localStorage) {
    $rootScope.enableUi();
    $scope.loading = false;

    $scope.login = function (user) {
      $scope.loading = true;
      authService.login(user, function (res) {
        $scope.loading = false;
        $localStorage.token = res.user.identity.token;
        $localStorage.ontimeToken = res.user.identity.ontimeToken;
        $rootScope.user = res.user;
        $rootScope.isAuthenticated = true;
        $location.path('/');
      }, function() {
        $scope.loading = false;
      });
    };
  }
];