'use strict';

var env = require('../env');

var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate',
  function($http, $translate) {
    var baseUrl = env.apiUrl;

    return {
      edit: function(data, success  , error) {
        callbacks.post(baseUrl + '/setting/edit', data, $http, $translate, success, error);
      },
      update: function(data, success, error) {
        callbacks.post(baseUrl + '/setting/update', data, $http, $translate, success, error);
      },
      get: function(data, success, error) {
        callbacks.get(baseUrl + '/setting', data, $http, $translate, success, error);
      },
      getSub: function(data, success, error) {
        callbacks.get(baseUrl + '/setting/sub', data, $http, $translate, success, error);
      }
    };
  }
];