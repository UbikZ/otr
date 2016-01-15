'use strict';

var express = require('express');
var config = require('./config.json');
var argv = require('yargs').argv;
var app = express();

config.env.current = process.env.NODE_ENV || argv.env;
config.env.debug = (config.env.current !== 'production');

var port = config.env[config.env.current].port;
var host = config.env[config.env.current].host;

require('./src/server/middleware')(app, config);

app.listen(port, function () {
  console.log('Express server started on port %s', port);
});

module.exports = app;