'use strict';

var Organization = require('../models/organization');
var User = require('../models/user');
var http = require('./helpers/http');

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version + '/organization';

  /*
   * Get users (by filtering)
   */
  app.get(prefix, http.ensureAuthorized, function (req, res) {
    // todo: add filters
    http.checkAuthorized(req, res, function () {
      Organization.find({}, function (err, organizations) {
        if (err) {
          http.response(res, 500, "An error occurred.", err);
        } else if (organizations) {
          http.response(res, 200, {organizations: organizations});
        } else {
          http.response(res, 404, {}, "User not found.", err);
        }
      });
    });
  });

  app.post(prefix + '/update', http.ensureAuthorized, function (req, res) {
    var data = req.body;

    http.checkAuthorized(req, res, function (user) {
      Organization.findById(data._id, function (err, organization) {
        if (err) {
          http.response(res, 500, "An error occurred.", err);
        } else if (organization) {
          if (data.name) {
            organization.name = data.name;
          }
          if (data.description) {
            organization.name = data.description;
          }
          if (data.active) {
            organization.name = data.active;
          }
          if (data.logo) {
            organization.name = data.logo;
          }
          organization.update = {user: user._id, date: Date.now};
          organization.save(function (err, newOrganization) {
            if (err) {
              http.response(res, 500, {}, "An error occurred.", err);
            } else {
              http.response(res, 200, {organization: newOrganization});
            }
          });
        } else {
          var org = new Organization({
            name: data.name,
            description: data.description,
            active: true,
            logo: data.logo,
            creation: {user: user._id},
            update: {user: user._id},
          });
          org.save(function (err, newOrganization) {
            if (err) {
              http.response(res, 500, {}, "An error occurred.", err);
            } else {
              http.response(res, 200, {organization: newOrganization});
            }
          });
        }
      });
    });
  });
};
