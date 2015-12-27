'use strict';

var angular = require('angular');
var env = require('../env');

var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate',
  function($http, $translate) {
    var baseUrl = env.apiUrl;

    return {
      edit: function(data, success, error) {
        callbacks.post(baseUrl + '/version/edit', data, $http, $translate, success, error);
      },
      get: function(data, success, error) {
        callbacks.get(baseUrl + '/version', data, $http, $translate, success, error);
      },
      delete: function(data, success, error) {
        callbacks.post(baseUrl + '/item/delete', data, $http, $translate, success, error);
      }
    };
  }
];