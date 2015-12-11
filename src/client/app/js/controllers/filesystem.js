'use strict';

var toastr = require('toastr');

module.exports = ['$scope', '$rootScope', 'organizationService',
  function ($scope, $rootScope, organizationService) {
    var organization = organizationService.getCurrentOrganization();

    $scope.treeOptions = {
      nodeChildren: "children",
      dirSelectable: true,
    };

    $scope.dataForTheTree =
      [
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
  }
];