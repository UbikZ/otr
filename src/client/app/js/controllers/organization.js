'use strict';

var toastr = require('toastr');

module.exports = ['$scope', '$rootScope', 'organizationService', '$uibModal',
  function ($scope, $rootScope, organizationService, $uibModal) {
    $scope.loading = true;

    organizationService.get({}, function (res) {
      $scope.loading = false;
      $scope.organizations = res.organizations;
    }, function (err) {
      $scope.loading = false;
      toastr.error(err.message);
    });

    $scope.open = function (objectId) {
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
        if (objectId) {
          $scope.organizations.forEach(function (org, index) {
            if (org._id === organization._id) {
              $scope.organizations[index] = organization;
            }
          });
        } else {
          $scope.organizations.push(organization);
        }
      });
    }
  }
];