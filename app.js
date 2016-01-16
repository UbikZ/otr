'use strict';

var express = require('express');
var config = require('./config.json');
var argv = require('yargs').argv;
var app = express();

config.env.debug = (process.env.NODE_ENV !== 'production');

var port = config.env[process.env.NODE_ENV].port;

require('./src/server/middleware')(app, config);

app.listen(port);

module.exports = app;