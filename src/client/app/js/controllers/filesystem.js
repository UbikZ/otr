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
          { "name" : "Smith", "age" : "42", "children" : [] },
          { "name" : "Gary", "age" : "21", "children" : [
            { "name" : "Jenifer", "age" : "23", "children" : [
              { "name" : "Dani", "age" : "32", "children" : [] },
              { "name" : "Max", "age" : "34", "children" : [] }
            ]}
          ]}
        ]},
        { "name" : "Albert", "age" : "33", "children" : [] },
        { "name" : "Ron", "age" : "29", "children" : [] }
      ];
  }
];