'use strict';

var path = require('path');

module.exports.controller = function (app, config, logger) {
  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, config.path.public + '/index.html'));
  });
};