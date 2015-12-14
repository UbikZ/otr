'use strict';

var toastr = require('toastr');

module.exports = ['$scope', '$rootScope', 'organizationService', '$uibModal',
  function ($scope, $rootScope, organizationService, $uibModal) {

    $rootScope.$on('broadcast-organization', function(event, args) {
      $scope.organization = args.organization;
      $scope.documents = args.organization.documents;
      $scope.projects = args.organization.projects;
    });

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
          organizationId: function() {
            return $scope.organization._id;
          },
          identifier: function () {
            return objectId;
          },
        }
      });

      modalInstance.result.then(function (orga) {
        if (objectId) {
          // todo : recursive find and push item
        } else {
          $scope.organization = orga;
          $scope.documents = orga.documents;
          $scope.projects = orga.projects;
        }
      });
    };

    $scope.delete = function(objectId) {
      // todo
    };
  }
];