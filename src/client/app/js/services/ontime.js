'use strict';

var angular = require('angular');
var env = require('../env');
var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate',
  function ($http, $translate) {
    var baseUrl = env.apiUrl + '/ontime';

    return {
      meOntime: function (data, success, error) {
        callbacks.get(baseUrl + '/me', data, $http, $translate, success, error);
      },
      tree: function (data, success, error) {
        callbacks.get(baseUrl + '/tree', data, $http, $translate, success, error);
      },
    };
  }
];