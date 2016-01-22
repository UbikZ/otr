'use strict';

var toastr = require('toastr');
var jquery = require('jquery');

function ok(res, $translate) {
  if (res.messageCode !== undefined) {
    $translate('messages.success.' + res.messageCode).then(function (msg) {
      toastr.success(msg);
    });
  }
}

function ko(res, $translate, $rootScope) {
  if (res.messageCode !== undefined) {
    $translate('messages.error.' + res.messageCode).then(function (msg) {
      toastr.error(msg);
    });
    // Invalid token (ot & otr)
    if (~['-2', '-3'].indexOf(res.messageCode)) {
      $rootScope.logout();
      window.location.hash = '/login'; // dirty
    }
  }
}

function requestResult($http, $translate, $rootScope, success, error) {
  $http
    .success(function (res) {
      if (res !== undefined) {
        ok(res, $translate);
        if (success !== undefined) {
          success(res);
        }
      }
    })
    .error(function (res) {
      if (res !== undefined) {
        ko(res, $translate, $rootScope);
        if (error !== undefined) {
          error(res);
        }
      }
    });
}

function post(url, data, $http, $translate, $rootScope, success, error) {
  requestResult($http.post(url, data), $translate, $rootScope, success, error);
}

function get(url, data, $http, $translate, $rootScope, success, error) {
  requestResult($http.get(url + '?' + jquery.param(data), data), $translate, $rootScope, success, error);
}

module.exports = {
  post: post,
  get: get,
};