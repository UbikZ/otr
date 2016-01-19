'use strict';

var winston = require('winston');
var config = require('../../config.json');
var moment = require('moment');

var transports = [];

transports.push(new winston.transports.Console({
  level: process.env.NODE_ENV == 'staging' ? 'error' : 'debug',
  handleExceptions: true,
  json: false,
  colorize: true
}));

transports.push(new winston.transports.File({
  level: 'info',
  filename: config.path.logs + '/' + process.env.NODE_ENV + '.otr.' + moment().format('YYYY-MM-DD') + '.0.log',
  handleExceptions: true,
  json: true,
  maxsize: 5242880, //5MB
  colorize: false,
}));

var logger = new winston.Logger({transports: transports, exitOnError: false});

module.exports = logger;
module.exports.stream = {
  write: function (message) {
    logger.info(message);
  }
};