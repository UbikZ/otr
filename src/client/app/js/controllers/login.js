'use strict';

var toastr = require('toastr');

module.exports = ['$scope', '$rootScope', 'authService', '$location', '$localStorage',
  function ($scope, $rootScope, authService, $location, $localStorage) {
    $scope.login = function (user) {
      authService.login(user, function (res) {
        $localStorage.token = res.user.identity.token;
        $localStorage.ot_token = res.user.identity.ontime_token;
        $rootScope.user = res.user;
        $rootScope.isAuthenticated = true;
        $location.path('/');
      }, function (err) {
        toastr.error(err.message);
      });
    };
  }
];