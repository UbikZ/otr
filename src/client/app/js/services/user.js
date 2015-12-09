'use strict';

var angular = require('angular');
var env = require('../env');
var jquery = require('jquery');

module.exports = ['$http',
  function($http) {
    var baseUrl = env.apiUrl;

    return {
      update: function(data, success, error) {
        $http.post(baseUrl + '/user/update', data).success(success).error(error)
      },
      get: function(data, success, error) {
        var url = baseUrl + '/user?' + jquery.param(data);
        $http.get(url).success(success).error(error)
      }
    };
  }
];