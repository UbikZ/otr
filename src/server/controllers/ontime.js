'use strict';

var merge = require('merge');
var http = require('./helpers/http');
var ontimeRequester = require('./helpers/ontime');

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version + '/ontime';

  app.get(prefix + '/me', http.ensureAuthorized, function (req, res) {
    http.checkAuthorized(req, res, function () {
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

  app.get(prefix + '/tree', http.ensureAuthorized, function (req, res) {
    http.checkAuthorized(req, res, function () {
      ontimeRequester.tree(req.ot_token, function (result) {
        result = JSON.parse(result);
        if (result.error) {
          http.log(req, 'Ontime Error: ' + result.error_description);
          http.response(res, 403, {error: result}, "-3", result.error);
        } else if (result.data) {
          http.response(res, 200, {tree: result.data});
        } else {
          http.log(req, 'Ontime Error: issue during OnTime "/tree" request');
          http.response(res, 500, {}, "-1");
        }
      });
    });
  });

  app.get(prefix + '/items', http.ensureAuthorized, function (req, res) {
    http.checkAuthorized(req, res, function () {
      ontimeRequester.items(req.ot_token, req.query.projectId, function (result) {
        result = JSON.parse(result);
        if (result.error) {
          http.log(req, 'Ontime Error: ' + result.error_description);
          http.response(res, 403, {error: result}, "-3", result.error);
        } else if (result.data) {
          http.response(res, 200, {items: result.data});
        } else {
          http.log(req, 'Ontime Error: issue during OnTime "/items" request');
          http.response(res, 500, {}, "-1");
        }
      });
    });
  });

};
