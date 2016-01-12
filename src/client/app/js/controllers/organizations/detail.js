'use strict';

module.exports = ['$scope', '$rootScope', '$stateParams', 'organizationService', '$uibModal', '$location',
  function ($scope, $rootScope, $stateParams, organizationService, $uibModal, $location) {
    organizationService.get({id: $stateParams.id}, function (res) {
      if (res.organizations.length == 0) {
        $location.path('/');
      } else {
        $rootScope.enableUi();
        $scope.organization = res.organizations[0];
        $scope.$broadcast('load-organization', {organization: $scope.organization});
      }
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