'use strict';

var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var config = require('./config.json');
var argv = require('yargs').argv;
var fs = require('fs');
var mongoose = require('mongoose');

var server = http.createServer(app);
var io = require('socket.io')(server);

// default
var env = process.env.NODE_ENV || argv.env;
var port = 3000, host = 'localhost';

app.use(bodyParser.json());
app.use(express.static(config.path.public));

// db
mongoose.connect(config.mongo.uri);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function (callback) { console.log('Connection OK.'); });

// Add models
fs.readdirSync(config.path.server.model).forEach(function (file) {
  if(file.substr(-3) == '.js') {
    require(config.path.server.model + '/' + file);
  }
});

require(config.path.server.socket)(io, config);

// Add routes from controller file
fs.readdirSync(config.path.server.controller).forEach(function (file) {
  if(file.substr(-3) == '.js') {
    require(config.path.server.controller + '/' + file).controller(app, io, config);
  }
});


server.listen(port, host);
server.on('listening', function() {
  console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});