'use strict';

var Organization = require('../models/organization');
var User = require('../models/user');
var mongoose = require('mongoose');
var http = require('./helpers/http');

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version + '/organization';

  /*
   * Get organizations (by filtering)
   */
  app.get(prefix, http.ensureAuthorized, function (req, res) {
    var data = req.query;
    http.checkAuthorized(req, res, function () {
      var criteria = {}, fields = {};
      if (data.id) {
        criteria = {_id: new mongoose.Types.ObjectId(data.id)};
      }
      /*jshint eqeqeq: false */
      if (data.lazy == 1) {
      /*jshint eqeqeq: true */
        fields = {name: 1, description: 1, active: 1, url: 1, logo: 1, creation: 1};
      }

      var query = Organization.find(criteria, fields).lean().populate('creation.user');

      query.exec(function (err, organizations) {
        if (err) {
          http.log(req, 'Internal error: get organizations', err);
          http.response(res, 500, {}, "-1", err);
        } else if (organizations) {
          /*jshint eqeqeq: false */
          if (data.lazyVersion == 1) {
          /*jshint eqeqeq: true */
            organizations.forEach(function (organization) {
              Organization.walkRecursively(organization, function (element) {
                if (element.entries != undefined) {
                  delete element.entries;
                }
              });
            })
          }
          http.response(res, 200, {organizations: organizations});
        } else {
          http.log(req, 'Error: organizations is undefined (criteria = ' + criteria + ').');
          http.response(res, 404, {}, "-9");
        }
      });
    });
  });

  app.post(prefix + '/delete', http.ensureAuthorized, function (req, res) {
    var data = req.body;

    http.checkAuthorized(req, res, function () {
      Organization.findByIdAndRemove(data.id).lean().exec(function (err) {
        if (err) {
          http.log(req, 'Internal error: delete organization', err);
          http.response(res, 500, {}, "-1", err);
        } else {
          http.response(res, 200, {id: data.id}, "7");
        }
      });
    });
  });

  app.post(prefix + '/edit', http.ensureAuthorized, function (req, res) {
    var data = req.body, fields = {};

    /*jshint eqeqeq: false */
    if (data.lazy == 1) {
    /*jshint eqeqeq: true */
      fields = {name: 1, description: 1, active: 1, url: 1, logo: 1, creation: 1};
    }

    http.checkAuthorized(req, res, function (user) {
      Organization.findById(data._id, fields).lean().populate('creation.user').exec(function (err, organization) {
        if (err) {
          http.log(req, 'Internal error: update organization', err);
          http.response(res, 500, {}, "-1", err);
        } else if (organization) {
          if (data.name) {
            organization.name = data.name;
          }
          if (data.description) {
            organization.description = data.description;
          }
          if (data.active != undefined) {
            organization.active = data.active;
          }
          if (data.logo) {
            organization.logo = data.logo;
          }
          if (data.url) {
            organization.url = data.url;
          }
          organization.update = {user: user._id, date: new Date()};
          Organization.update({_id: organization._id}, organization, {}).lean().exec(function (err, raw) {
            if (err) {
              http.log(req, 'Internal error: update organization -> save organization', err);
              http.response(res, 500, {}, "-1", err);
            } else {
              http.response(res, 200, {organization: organization}, "6");
            }
          });
        } else {
          var org = new Organization({
            name: data.name,
            creation: {user: user._id},
            update: {user: user._id},
          });

          if (data.description) {
            org.description = data.description;
          }
          if (data.active != undefined) {
            org.active = data.active;
          }
          if (data.logo) {
            org.logo = data.logo;
          }
          if (data.url) {
            org.url = data.url;
          }

          Organization.update({_id: org._id}, org, {upsert: true}).lean().exec(function (err, raw) {
            if (err) {
              http.log(req, 'Internal error: create organization -> save organization', err);
              http.response(res, 500, {}, "-1", err);
            } else {
              http.response(res, 200, {organization: org}, "5");
            }
          });
        }
      });
    });
  });
};
