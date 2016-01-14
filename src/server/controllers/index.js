'use strict';

module.exports.controller = function (app, config) {
  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, config.path.public + '/index.html'));
  });
};