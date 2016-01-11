'use strict';

var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var config = require('./config.json');
var argv = require('yargs').argv;
var fs = require('fs');
var mongoose = require('mongoose');
var app = express();


var port = 3000, host = 'localhost';

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
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

// db
mongoose.connect(config.mongo.uri);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function (cb) {
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

app.listen(port, function () {
  console.log('Express server started on port %s', port);
});