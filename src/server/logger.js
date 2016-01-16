'use strict';

var winston = require('winston');
var config = require('../../config.json');
var moment = require('moment');

module.exports = function(config) {
  var transports = [], json = false;

  if (config.env.current != 'staging') {
    transports.push(new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    }));
    json = true;
  }

  transports.push(new winston.transports.File({
    level: 'info',
    filename: config.path.logs + '/' + config.env.current + '.otr.' + moment().format('YYYY-MM-DD') + '.0.log',
    handleExceptions: true,
    json: json,
    maxsize: 5242880, //5MB
    colorize: false,
  }));

  var logger = new winston.Logger({transports: transports, exitOnError: false});

  return {
    instance: logger,
    stream: {
      write: function (message) {
        logger.info(message);
      }
    },
  };
};