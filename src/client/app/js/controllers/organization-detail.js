'use strict';

var toastr = require('toastr');

module.exports = ['$scope', '$rootScope', '$stateParams', 'organizationService', '$uibModal',
  function ($scope, $rootScope, $stateParams, organizationService, $uibModal) {
    organizationService.get({id: $stateParams.id, populate: true}, function (res) {
      if (res.organizations.length != 1) {
        toastr.error('Error loading current organization.');
      } else {
        $scope.organization = res.organizations[0];
        organizationService.setCurrentOrganization($scope.organization);
      }
      $scope.loading = false;
    }, function (err) {
      $scope.loading = false;
      toastr.error(err.message);
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