'use strict';

var toastr = require('toastr');

function success(res, $translate) {
  if (res.messageCode != undefined) {
    $translate('messages.success.' + res.messageCode).then(function (msg) {
      toastr.success(msg);
    });
  }
}

function error(res, $translate) {
  if (res.messageCode != undefined) {
    $translate('messages.error.' + res.messageCode).then(function (msg) {
      toastr.error(msg);
    });
  }
}

module.exports = {
  success: success,
  error: error,
};