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
      edit: function(data, success, error) {
        var url = baseUrl + (data._id == undefined ? '/item/create' : '/item/update');
        $http.post(url, data).success(success).error(error);
      },
      delete: function(data, success, error) {
        $http.post(baseUrl + '/item/delete', data).success(success).error(error);
      }
    };
  }
];