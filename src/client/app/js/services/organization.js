'use strict';

var env = require('../env');

var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate', '$rootScope',
  function ($http, $translate, $rootScope) {
    var baseUrl = env.apiUrl, currentOrganization;

    return {
      get: function (data, success, error) {
        callbacks.get(baseUrl + '/organization', data, $http, $translate, $rootScope, function (result) {
          if (result.organizations.length === 1) {
            currentOrganization = result.organizations[0];
          }
          success(result);
        }, error);
      },
      update: function (data, success, error) {
        callbacks.post(baseUrl + '/organization/edit', data, $http, $translate, $rootScope, success, error);
      },
      delete: function (data, success, error) {
        callbacks.post(baseUrl + '/organization/delete', data, $http, $translate, $rootScope, success, error);
      }
    };
  }
];