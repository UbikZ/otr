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
      update: function(data, success) {
        $http.post(baseUrl + '/user/update', data).success(function(res) {
          ok(res, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      },
      get: function(data, success) {
        var url = baseUrl + '/user?' + jquery.param(data);
        $http.get(url).success(function(res) {
          ok(res, success);
        }).error(function (err) {
          callbacks.error(err, $translate);
        });
      }
    };
  }
];