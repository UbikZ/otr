'use strict';

var env = require('../env');

var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate', '$rootScope',
  function($http, $translate, $rootScope) {
    var baseUrl = env.apiUrl;

    return {
      edit: function(data, success  , error) {
        callbacks.post(baseUrl + '/setting/edit', data, $http, $translate, $rootScope, success, error);
      },
      update: function(data, success, error) {
        callbacks.post(baseUrl + '/setting/update', data, $http, $translate, $rootScope, success, error);
      },
      get: function(data, success, error) {
        callbacks.get(baseUrl + '/setting', data, $http, $translate, $rootScope, success, error);
      },
      getSub: function(data, success, error) {
        callbacks.get(baseUrl + '/setting/sub', data, $http, $translate, $rootScope, success, error);
      }
    };
  }
];