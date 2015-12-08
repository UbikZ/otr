'use strict';

var moment = require('moment');
var merge = require('merge');

module.exports = {
  sendJSON: function(res, status, data, err) {
    var dat = merge({
      date: moment().format('YYYY-MM-DD HH:mm:SS'),
      code: status,
      error: err,
      message: null
    }, data);

    res.status(status);
    res.json(dat)
  }
};