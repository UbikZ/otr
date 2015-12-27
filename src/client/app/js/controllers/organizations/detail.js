'use strict';

var toastr = require('toastr');

module.exports = ['$scope', '$rootScope', '$stateParams', 'organizationService', '$uibModal',
  function ($scope, $rootScope, $stateParams, organizationService, $uibModal) {
    organizationService.get({id: $stateParams.id}, function (res) {
      $scope.organization = res.organizations[0];
      $scope.$broadcast('load-organization', {organization: $scope.organization});
    });

    $scope.edit = function (objectId) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'views/partials/modal-organization.html',
        controller: 'form.organization.controller',
        resolve: {
          identifier: function () {
            return objectId;
          },
        }
      });

      modalInstance.result.then(function (organization) {
        $scope.organization = organization;
      });
    };
  }
];