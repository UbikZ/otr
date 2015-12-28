'use strict';

var angular = require('angular');
var env = require('../env');
var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate',
  function ($http, $translate) {
    var baseUrl = env.apiUrl;

    return {
      authenticate: function (data, success, error) {
        callbacks.post(baseUrl + '/authenticate', data, $http, $translate, success, error);
      },
      login: function (data, success, error) {
        callbacks.post(baseUrl + '/sign-up', data, $http, $translate, success, error);
      },
      me: function (data, success, error) {
        callbacks.get(baseUrl + '/me', data, $http, $translate, success, error);
      },
      meOntime: function (data, success, error) {
        callbacks.get(baseUrl + '/ontime/me', data, $http, $translate, success, error);
      },
    };
  }
];