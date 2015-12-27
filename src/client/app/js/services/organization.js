'use strict';

var angular = require('angular');
var env = require('../env');
var jquery = require('jquery');

var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate',
  function($http, $translate) {
    var baseUrl = env.apiUrl, currentOrganization;

    function ok(res, cb) {
      callbacks.success(res, $translate);
      cb(res);
    }

    return {
      setCurrentOrganization: function(organization) {
        currentOrganization = organization;
      },
      getCurrentOrganization: function() {
        return currentOrganization;
      },
      get: function(data, success) {
        var url = baseUrl + '/organization?' + jquery.param(data);
        $http.get(url).success(function (result) {
          if (result.organizations.length == 1) {
            currentOrganization = result.organizations[0];
          }
          ok(result, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      },
      update: function(data, success) {
        $http.post(baseUrl + '/organization/edit', data).success(function(res) {
          ok(res, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      },
      delete: function(data, success) {
        $http.post(baseUrl + '/organization/delete', data).success(function(res) {
          ok(res, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      }
    };
  }
];