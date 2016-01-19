'use strict';

var express = require('express');
var config = require('./config.json');
var app = express();

config.env.debug = !~['staging', 'production'].indexOf(process.env.NODE_ENV);

var port = config.env[process.env.NODE_ENV].port;

require('./src/server/middleware')(app, config);

app.listen(port);

module.exports = app;