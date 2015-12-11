'use strict';

var angular = require('angular');
var env = require('../env');
var jquery = require('jquery');

module.exports = ['$http',
  function($http) {
    var baseUrl = env.apiUrl, currentOrganization;

    return {
      setCurrentOrganization: function(organization) {
        currentOrganization = organization;
      },
      getCurrentOrganization: function() {
        return currentOrganization;
      },
      get: function(data, success, error) {
        var url = baseUrl + '/organization?' + jquery.param(data);
        $http.get(url).success(success).error(error)
      },
      update: function(data, success, error) {
        $http.post(baseUrl + '/organization/update', data).success(success).error(error);
      },
      delete: function(data, success, error) {
        $http.post(baseUrl + '/organization/delete', data).success(success).error(error);
      }
    };
  }
];