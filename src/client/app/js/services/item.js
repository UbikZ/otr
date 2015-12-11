'use strict';

var angular = require('angular');
var env = require('../env');
var jquery = require('jquery');

module.exports = ['$http',
  function($http) {
    var baseUrl = env.apiUrl;

    return {
      get: function(data, success, error) {
        var url = baseUrl + '/item?' + jquery.param(data);
        $http.get(url).success(success).error(error)
      },
      update: function(data, success, error) {
        $http.post(baseUrl + '/item/update', data).success(success).error(error);
      },
      delete: function(data, success, error) {
        $http.post(baseUrl + '/item/delete', data).success(success).error(error);
      }
    };
  }
];