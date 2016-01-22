'use strict';

var env = require('../env');
var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate', '$rootScope',
  function ($http, $translate, $rootScope) {
    var baseUrl = env.apiUrl;

    return {
      login: function (data, success, error) {
        callbacks.post(baseUrl + '/sign-up', data, $http, $translate, $rootScope, success, error);
      },
      me: function (data, success, error) {
        callbacks.get(baseUrl + '/me', data, $http, $translate, $rootScope, success, error);
      },
    };
  }
];