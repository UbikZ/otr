'use strict';

var angular = require('angular');
var env = require('../env');

var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate',
  function($http, $translate) {
    var baseUrl = env.apiUrl;

    return {
      get: function(data, success, error) {
        callbacks.get(baseUrl + '/item', data, $http, $translate, success, error);
      },
      edit: function(data, success, error) {
        var url = baseUrl + (data._id == undefined ? '/item/create' : '/item/update');
        callbacks.post(url, data, $http, $translate, success, error);
      },
      delete: function(data, success, error) {
        callbacks.post(baseUrl + '/item/delete', data, $http, $translate, success, error);
      }
    };
  }
];