'use strict';

module.exports.controller = function (app, config) {
  app.get('/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,HEAD');
    res.header('Access-Control-Allow-Headers', 'origin, x-requested-with, content-type, accept, authorization, cache-control');
    next();
  });

  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, config.path.public + '/index.html'));
  });
};