'use strict';

var Organization = require('../models/organization');
var http = require('./helpers/http');

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version + '/organization';

  /*
   * Get users (by filtering)
   */
  app.get(prefix, http.ensureAuthorized, function (req, res) {
    // todo: add filters
    Organization.find({}, function (err, organizations) {
      if (err) {
        http.response(res, 500, "An error occurred.", err);
      } else if (users) {
        http.response(res, 200, {organizations: organizations});
      } else {
        http.response(res, 404, {}, "User not found.", err);
      }
    });
  });
};
