'use strict';

var angular = require('angular');
var env = require('../env');
var jquery = require('jquery');

var callbacks = require('../helpers/callback');

module.exports = ['$http', '$translate',
  function($http, $translate) {
    var baseUrl = env.apiUrl;

    function ok(res, cb) {
      callbacks.success(res, $translate);
      cb(res);
    }

    return {
      edit: function(data, success) {
        $http.post(baseUrl + '/setting/edit', data).success(function(res) {
          ok(res, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      },
      update: function(data, success) {
        $http.post(baseUrl + '/setting/update', data).success(function(res) {
          ok(res, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      },
      get: function(data, success) {
        var url = baseUrl + '/setting?' + jquery.param(data);
        $http.get(url).success(function(res) {
          ok(res, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      },
      getSub: function(data, success) {
        var url = baseUrl + '/setting/sub?' + jquery.param(data);
        $http.get(url).success(function(res) {
          ok(res, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      }
    };
  }
];