'use strict';

var env = require('../env');

var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate', '$rootScope',
  function ($http, $translate, $rootScope) {
    var baseUrl = env.apiUrl;

    return {
      update: function (data, success, error) {
        callbacks.post(baseUrl + '/user/update', data, $http, $translate, $rootScope, success, error);
      },
      get: function (data, success, error) {
        callbacks.get(baseUrl + '/user', data, $http, $translate, $rootScope, success, error);
      }
    };
  }
];