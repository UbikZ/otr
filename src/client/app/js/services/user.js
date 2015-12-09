'use strict';

var angular = require('angular');
var env = require('../env');

module.exports = ['$http',
  function($http) {
    var baseUrl = env.apiUrl;

    return {
      update: function(data, success, error) {
        $http.post(baseUrl + '/user/update', data).success(success).error(error)
      },
    };
  }
];