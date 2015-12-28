'use strict';

module.exports = ['$scope', '$rootScope', 'ontimeService',
  function ($scope, $rootScope, ontimeService) {
    ontimeService.items({projectId: 2161}, function(res) {
      console.log(res);
    });
  }
];