'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var morgan = require('morgan');
var winston = require('winston');
var moment = require('moment');

module.exports = function (app, config) {

  var logger = new winston.Logger({
    transports: [
      new winston.transports.File({
        level: 'info',
        filename: config.path.logs + '/access.' + moment().format('YYYY-MM-DD') + '.log',
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
  logger.stream = {
    write: function (message) {
      logger.info(message);
    }
  };

  // Setup log rotate
  fs.existsSync(config.path.logs) || fs.mkdirSync(config.path.logs);
  app.use(morgan('combined', {stream: logger.stream}));

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  app.use(function (req, res, next) {
    // For production test (nginx will deliver statics files with specific rule)
    if (!config.env.debug && req.url.indexOf('.gz.') != -1) {
      res.setHeader('Content-Encoding', 'gzip');
    }
    //res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-tType, Authorization');
    next();
  });

  app.use(express.static(config.path.public));

  app.use(function (req, res, next) {
    var _send = res.send;
    var sent = false;
    res.send = function (data) {
      if (sent) return;
      _send.bind(res)(data);
      sent = true;
    };
    next();
  });

  // Database configuration
  mongoose.connect(config.env[config.env.current].mongo.uri);

  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'Connection error:'));
  db.once('open', function () {
    console.log('Connection OK.');
  });

  // Add models
  fs.readdirSync(config.path.server.model).forEach(function (file) {
    if (file.substr(-3) == '.js') {
      require(config.path.server.model + '/' + file);
    }
  });

  // Add routes from controller file
  fs.readdirSync(config.path.server.controller).forEach(function (file) {
    if (file.substr(-3) == '.js') {
      require(config.path.server.controller + '/' + file).controller(app, config);
    }
  });

  // Add extend prototypes for helper utilities
  fs.readdirSync(config.path.server.prototype).forEach(function (file) {
    if (file.substr(-3) == '.js') {
      require(config.path.server.prototype + '/' + file);
    }
  });
};