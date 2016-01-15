'use strict';

var winston = require('winston');
var config = require('../../config.json');
var moment = require('moment');

var logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: config.path.logs + '/otr.' + moment().format('YYYY-MM-DD') + '.0.log',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, //5MB
      colorize: false,
    }),
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});

module.exports = logger;
module.exports.stream = {
  write: function (message) {
    logger.info(message);
  }
};