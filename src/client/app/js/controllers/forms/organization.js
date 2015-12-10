'use strict';

var toastr = require('toastr');

module.exports = ['$rootScope', '$scope', 'societyObjectId', 'organizationService',
  function ($rootScope, $scope, societyObjectId, organizationService) {
    $scope.identifier = societyObjectId;

    $scope.submit = function (organization) {
      $scope.loading = true;
      if ($scope.identifier) {
        organization = Object.assign(organization, {_id: $scope.identifier});
      }
      organizationService.update(organization, function (res) {
        console.log(res);
        $scope.loading = false;
      }, function (err) {
        $scope.loading = false;
        toastr.error(err.message);
      });
    }
  }
];