'use strict';

var toastr = require('toastr');

module.exports = ['$rootScope', '$scope', 'identifier', 'itemService', '$uibModalInstance',
  function ($rootScope, $scope, identifier, itemService, $uibModalInstance) {
    $scope.identifier = identifier;

    if (identifier) {
      itemService.get({id: identifier}, function (res) {
        if (res.items.length != 1) {
          toastr.error('Error loading current item.');
        } else {
          $scope.item = res.items[0];
        }
        $scope.loading = false;
      }, function (err) {
        $scope.loading = false;
        toastr.error(err.message);
      });
    }

    $scope.submit = function (item) {
      $scope.loading = true;
      if ($scope.identifier) {
        item = Object.assign(item, {_id: $scope.identifier});
      }
      itemService.update(item, function (res) {
        $scope.loading = false;
        $uibModalInstance.close(res.item);
      }, function (err) {
        $scope.loading = false;
        toastr.error(err.message);
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
];