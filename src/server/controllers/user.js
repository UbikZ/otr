'use strict';

var User = require('../models/user');
var jwt = require("jsonwebtoken");
var http = require('./helpers/http');

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version + '/user';

  /*
   * Get users (by filtering)
   */
  app.get(prefix, http.ensureAuthorized, function (req, res) {
    http.checkAuthorized(req, res, function () {
      User.find({}).lean().exec(function (err, users) {
        if (err) {
          http.log(req, 'Internal error: get users', err);
          http.response(res, 500, {}, "-1", err);
        } else if (users) {
          http.response(res, 200, {users: users});
        } else {
          http.log(req, 'Error: users is undefined (criteria = ' + {} + ').');
          http.response(res, 404, {}, "-12");
        }
      });
    });
  });

  /*
   * Update user
   */
  app.post(prefix + '/update', http.ensureAuthorized, function (req, res) {
    var data = req.body;
    User.findOne({"identity.token": req.token}).lean().exec(function (err, user) {
      if (err) {
        http.log(req, 'Internal error: update user', err);
        http.response(res, 500, {}, "-1", err);
      } else if (user) {
        if (data.firstname) {
          user.name.firstname = data.firstname;
        }
        if (data.lastname) {
          user.name.lastname = data.lastname;
        }
        if (data.skype) {
          user.info.skype = data.skype;
        }
        if (data.location) {
          user.info.location = data.location;
        }
        if (data.job) {
          user.info.job = data.job;
        }
        User.update({_id: user._id}, user, {}, function (err, raw) {
          if (err) {
            http.log(req, 'Internal error: update user -> save user', err);
            http.response(res, 500, {}, "-1", err);
          } else {
            http.response(res, 200, {user: user}, "11");
          }
        });
      } else {
        http.response(res, 404, {}, "User not found.", err);
      }
    });
  });
};
