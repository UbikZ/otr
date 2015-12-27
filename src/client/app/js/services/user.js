'use strict';

var angular = require('angular');
var env = require('../env');

var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate',
  function($http, $translate) {
    var baseUrl = env.apiUrl;

    return {
      update: function(data, success, error) {
        callbacks.post(baseUrl + '/user/update', data, $http, $translate, success, error);
      },
      get: function(data, success) {
        callbacks.get(baseUrl + '/user', data, $http, $translate, success, error);
      }
    };
  }
];