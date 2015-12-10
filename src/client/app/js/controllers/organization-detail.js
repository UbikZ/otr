'use strict';

var toastr = require('toastr');

module.exports = ['$scope', '$rootScope', '$stateParams',
  function ($scope, $rootScope, $stateParams) {
    console.log($stateParams);
  }
];