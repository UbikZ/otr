'use strict';

var Organization = require('../models/organization');
var User = require('../models/user');
var mongoose = require('mongoose');
var http = require('./helpers/http');

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version + '/organization';

  /*
   * Get users (by filtering)
   */
  app.get(prefix, http.ensureAuthorized, function (req, res) {
    var data = req.query;
    http.checkAuthorized(req, res, function () {
      var criteria = {};
      if (data.id) {
        criteria = {_id: new mongoose.Types.ObjectId(data.id)};
      }
      
      var query = Organization.find(criteria).populate('creation.user');

      if (data.populate === true) {
        query.populate('projects').populate('settings');
      }

      query.exec(function (err, organizations) {
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

  app.post(prefix  + '/delete', http.ensureAuthorized, function (req, res) {
    var data = req.body;

    http.checkAuthorized(req, res, function () {
      Organization.findByIdAndRemove(data.id, function(err) {
        if (err) {
          http.response(res, 500, "An error occurred.", err);
        } else {
          http.response(res, 200, {id: data.id}, 'Your organization has been remove.');
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
          organization.update = {user: user._id, date: new Date()};
          organization.save(function (err, newOrganization) {
            if (err) {
              http.response(res, 500, {}, "An error occurred.", err);
            } else {
              newOrganization.populate('creation.user', function(err, newOrg) {
                http.response(res, 200, {organization: newOrg});
              });
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
              newOrganization.populate('creation.user', function(err, newOrg) {
                http.response(res, 200, {organization: newOrg});
              });
            }
          });
        }
      });
    });
  });
};
