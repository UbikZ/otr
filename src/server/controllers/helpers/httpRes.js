'use strict';

var moment = require('moment');
var merge = require('merge');

module.exports = {
  response: function(res, status, data, message, err) {
    var dat = merge({
      date: moment().format('YYYY-MM-DD HH:mm:SS'),
      code: status,
      error: err,
      message: message,
      data: {},
    }, data);

    res.status(status);
    res.json(dat)
  }
};