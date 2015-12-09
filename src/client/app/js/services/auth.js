'use strict';

var angular = require('angular');
var env = require('../env');

module.exports = ['$http',
  function($http) {
    var baseUrl = env.apiUrl;

    return {
      authenticate: function(data, success, error) {
        $http.post(baseUrl + '/authenticate', data).success(success).error(error)
      },
      login: function(data, success, error) {
        $http.post(baseUrl + '/sign-up', data).success(success).error(error)
      },
      me: function(success, error) {
        $http.get(baseUrl + '/me/').success(success).error(error)
      },
      meOntime: function(success, error) {
        $http.get(baseUrl + '/me-ontime/').success(success).error(error)
      },
    };
  }
];