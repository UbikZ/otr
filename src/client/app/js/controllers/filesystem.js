'use strict';

var toastr = require('toastr');
var recursiveTool = require('../helpers/recursive');

module.exports = ['$scope', '$rootScope', 'organizationService', 'itemService', '$uibModal',
  function ($scope, $rootScope, organizationService, itemService, $uibModal) {

    $scope.organization = organizationService.getCurrentOrganization();
    $scope.$watch($scope.organization, function () {
      if ($scope.organization != undefined) {
        $scope.documents = $scope.organization.documents;
        $scope.projects = $scope.organization.projects;
      }
    });

    $scope.treeOptions = {
      nodeChildren: "children",
      dirSelectable: true,
    };

    $scope.items = [
      {
        "name": "Joe", "age": "21", "type": "folder", "children": [
        {"name": "Smith", "age": "42", type: "file"},
        {
          "name": "Gary", "age": "21", "type": "folder", "children": [
          {
            "name": "Jenifer", "age": "23", "type": "folder", "children": [
            {"name": "Dani", "age": "32", type: "file"},
            {"name": "Max", "age": "34", type: "file"}
          ]
          }
        ]
        }
      ]
      },
      {"name": "Albert", "age": "33", type: "file"},
      {"name": "Ron", "age": "29", type: "file"}
    ];

    $scope.edit = function (objectId, type) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'views/partials/modal-item.html',
        controller: 'form.item.controller',
        resolve: {
          organizationId: function () {
            return $scope.organization._id;
          },
          identifier: function () {
            return {id: objectId, type: type};
          },
        }
      });

      modalInstance.result.then(function (orga) {
        $scope.organization = orga;
        if (objectId) {
          var itemType = type == undefined ? 'projects' : 'documents';
          recursiveTool.findRecursivelyById($scope.organization, itemType, objectId, function(item) {
            $scope[itemType].forEach(function(itemToUpdate, index) {
              if (itemToUpdate._id === item._id) {
                $scope[itemType][index] = item;
              }
            });
          });
        } else {
          $scope.documents = orga.documents;
          $scope.projects = orga.projects;
        }
      });
    };

    $scope.delete = function (objectId, type) {
      $scope.deleteLoading = true;

      var data = Object.assign(
        {organizationId: $scope.organization._id},
        type == 'document' ? {documentId: objectId} : {projectId: objectId}
      );

      itemService.delete(data,
        function (res) {
          var itemType = type == undefined ? 'projects' : 'documents';
          recursiveTool.removeRecursivelyById($scope.organization, itemType, objectId, function(items) {
            $scope[itemType] = items;
          });
          $scope.organization = res.organization;
          $scope.deleteLoading = false;
        }, function (err) {
          $scope.deleteLoading = false;
          toastr.error(err.message);
        }
      );
    };
  }
];