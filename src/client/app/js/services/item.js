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
      get: function(data, success) {
        var url = baseUrl + '/item?' + jquery.param(data);
        $http.get(url).success(function(res) {
          ok(res, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      },
      edit: function(data, success) {
        var url = baseUrl + (data._id == undefined ? '/item/create' : '/item/update');
        $http.post(url, data).success(function(res) {
          ok(res, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      },
      delete: function(data, success) {
        $http.post(baseUrl + '/item/delete', data).success(function(res) {
          ok(res, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      }
    };
  }
];