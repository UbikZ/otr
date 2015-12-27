'use strict';

var toastr = require('toastr');
var jquery = require('jquery');

function ok(res, $translate) {
  if (res.messageCode != undefined) {
    $translate('messages.success.' + res.messageCode).then(function (msg) {
      toastr.success(msg);
    });
  }
}

function ko(res, $translate) {
  if (res.messageCode != undefined) {
    $translate('messages.error.' + res.messageCode).then(function (msg) {
      toastr.error(msg);
    });
  }
}

function requestResult($http, $translate, success, error) {
  $http
    .then(function (res) {
      if (res != undefined) {
        ok(res.data, $translate);
        if (success != undefined) {
          success(res.data);
        }
      }
    })
    .then(function (res) {
      if (res != undefined) {
        ko(res.data, $translate);
        if (error != undefined) {
          error(res.data);
        }
      }
    });
}

function post(url, data, $http, $translate, success, error) {
  requestResult($http.post(url, data), $translate, success, error);
}

function get(url, data, $http, $translate, success, error) {
  requestResult($http.get(url + '?' + jquery.param(data), data), $translate, success, error);
}

module.exports = {
  post: post,
  get: get,
};