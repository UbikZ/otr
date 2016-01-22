'use strict';

var env = require('../env');
var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate', '$rootScope',
  function ($http, $translate, $rootScope) {
    var baseUrl = env.apiUrl + '/ontime';

    return {
      meOntime: function (data, success, error) {
        callbacks.get(baseUrl + '/me', data, $http, $translate, $rootScope, success, error);
      },
      tree: function (data, success, error) {
        callbacks.get(baseUrl + '/tree', data, $http, $translate, $rootScope, success, error);
      },
      project: function (data, success, error) {
        callbacks.get(baseUrl + '/project', data, $http, $translate, $rootScope, success, error);
      },
      items: function (data, success, error) {
        callbacks.get(baseUrl + '/items', data, $http, $translate, $rootScope, success, error);
      },
    };
  }
];