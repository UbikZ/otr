'use strict';

var env = require('../env');

var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate',
  function($http, $translate) {
    var baseUrl = env.apiUrl, currentOrganization;

    return {
      get: function(data, success, error) {
        callbacks.get(baseUrl + '/organization', data, $http, $translate, function(result) {
          if (result.organizations.length ===  1) {
            currentOrganization = result.organizations[0];
          }
          success(result);
        }, error);
      },
      update: function(data, success, error) {
        callbacks.post(baseUrl + '/organization/edit', data, $http, $translate, success, error);
      },
      delete: function(data, success, error) {
        callbacks.post(baseUrl + '/organization/delete', data, $http, $translate, success, error);
      }
    };
  }
];