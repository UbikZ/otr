'use strict';

var angular = require('angular');
var env = require('../env');
var jquery = require('jquery');

module.exports = ['$http',
  function($http) {
    var baseUrl = env.apiUrl;

    return {
      get: function(data, success, error) {
        var url = baseUrl + '/organization?' + jquery.param(data);
        $http.get(url).success(success).error(error)
      }
    };
  }
];