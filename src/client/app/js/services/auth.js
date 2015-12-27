'use strict';

var angular = require('angular');
var env = require('../env');
var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate',
  function ($http, $translate) {
    var baseUrl = env.apiUrl;

    function ok(res, cb) {
      callbacks.success(res, $translate);
      cb(res);
    }

    return {
      authenticate: function (data, success) {
        $http.post(baseUrl + '/authenticate', data).success(function(res) {
          ok(res, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      },
      login: function (data, success) {
        $http.post(baseUrl + '/sign-up', data).success(function(res) {
          ok(res, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      },
      me: function (success) {
        $http.get(baseUrl + '/me/').success(function(res) {
          ok(res, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      },
      meOntime: function (success) {
        $http.get(baseUrl + '/me-ontime/').success(function(res) {
          ok(res, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      },
    };
  }
];