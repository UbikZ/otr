'use strict';

var http = require('./helpers/http');
var ontimeRequester = require('./helpers/ontime');
var merge = require('merge');

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version + '/ontime';

  app.get(prefix + '/me', http.ensureAuthorized, function (req, res) {
    http.checkAuthorized(req, res, function() {
      ontimeRequester.me(req.ot_token, function (result) {
        result = JSON.parse(result);
        if (result.error) {
          http.log(req, 'Ontime Error: ' + result.error_description);
          http.response(res, 403, {error: result}, "-3", result.error);
        } else if (result.data) {
          http.response(res, 200, {ontime_user: result.data});
        } else {
          http.log(req, 'Ontime Error: issue during OnTime "/me" request');
          http.response(res, 500, {}, "-1");
        }
      });
    });
  });

  app.get(prefix, http.ensureAuthorized, function (req, res) {
    var data = req.query;
    http.checkAuthorized(req, res, function() {
      var criteria = {};
      if (data.id) {
        criteria.id = data.id;
      }
      Setting.find(criteria, function (err, settings) {
        if (err) {
          http.log(req, 'Internal error: get setting', err);
          http.response(res, 500, {}, "-1", err);
        } else if (settings) {
          http.response(res, 200, {setting: settings[0]});
        } else {
          http.log(req, 'Error: settings is undefined (criteria = ' + criteria + ').');
          http.response(res, 404, {}, "-10");
        }
      });
    });
  });
};
