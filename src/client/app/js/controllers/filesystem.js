'use strict';

var toastr = require('toastr');

module.exports = ['$scope', '$rootScope', 'organizationService', '$uibModal',
  function ($scope, $rootScope, organizationService, $uibModal) {
    var organization = organizationService.getCurrentOrganization();

    $scope.treeOptions = {
      nodeChildren: "children",
      dirSelectable: true,
    };

    $scope.items = [
      { "name" : "Joe", "age" : "21", "type": "folder", "children" : [
        { "name" : "Smith", "age" : "42", type: "file"},
        { "name" : "Gary", "age" : "21", "type": "folder", "children" : [
          { "name" : "Jenifer", "age" : "23", "type": "folder", "children" : [
            { "name" : "Dani", "age" : "32", type: "file" },
            { "name" : "Max", "age" : "34", type: "file" }
          ]}
        ]}
      ]},
      { "name" : "Albert", "age" : "33", type: "file" },
      { "name" : "Ron", "age" : "29", type: "file" }
    ];

    $scope.edit = function (objectId) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'views/partials/modal-item.html',
        controller: 'form.item.controller',
        resolve: {
          identifier: function () {
            return objectId;
          },
        }
      });

      modalInstance.result.then(function (item) {
        if (objectId) {
          $scope.items.forEach(function (element, index) {
            if (element._id === item._id) {
              $scope.items[index] = item;
            }
          });
        } else {
          $scope.items.push(item);
        }
      });
    };

    $scope.delete = function(objectId) {
      // todo
    };
  }
];