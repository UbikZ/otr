'use strict';

var express = require('express');
var config = require('./config.json');
var app = express();

config.env.debug = !~['staging', 'production'].indexOf(process.env.NODE_ENV);

var port = config.env[process.env.NODE_ENV].port;

require('./src/server/middleware')(app, config);

if (!module.parent) {
  app.listen(port);
} else {
  module.exports = app;
}