'use strict';

var toastr = require('toastr');

module.exports = ['$rootScope', '$scope', 'societyObjectId',
  function ($rootScope, $scope, societyObjectId) {
    $scope.var = societyObjectId;
  }
];