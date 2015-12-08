'use strict';

var toastr = require('toastr');

module.exports = ['$rootScope', '$scope', '$http',
  function($rootScope, $scope, $http) {
    $scope.update = function(profile) {
      $http.post('/user', Object.assign(profile, { id: $rootScope.user._id }))
        .then(function(sucess) {
          $rootScope.user = sucess.data.user;
        }, function(error) {
          toastr.error('Can\'t update your profile !');
        }
      );
    }
  }
];