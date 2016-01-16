'use strict';

var User = require('../models/user');
var otrConf = require('../config/ontime.json');
var jwt = require("jsonwebtoken");

module.exports.controller = function (app, config, logger) {
  var http = require('./helpers/http')(config, logger);

  var prefix = '/api/v' + config.api.version;

  /*
   * Sigin with OnTime
   */
  app.post(prefix + '/sign-up', function (req, res) {
    http.ontimeRequestToken(req, res, function (userData) {
      User.findOne({"info.email": userData.email}).lean().exec(function (err, user) {
        if (err) {
          http.log(req, 'Internal error: check /sign-up.', err);
          http.response(res, 500, {}, "-1", err);
        } else if (user) {
          user.identity.ontime_token = userData.access_token;
          User.update({_id: user._id}, user, {}, function (err, raw) {
            if (err) {
              http.log(req, 'Internal error: check /sign-up -> update user -> save', err);
              http.response(res, 500, {}, "-1", err);
            } else {
              http.response(res, 200, {user: user}, "1");
            }
          });
        } else {
          var userModel = new User();
          userModel.identity.ontime_token = userData.access_token;
          userModel.info.email = userData.email;
          userModel.name.username = req.body.username;
          userModel.name.firstname = userData.first_name;
          userModel.name.lastname = userData.last_name;
          userModel.save(function (err, user) {
            user.identity.token = jwt.sign(user._id, otrConf.jwt_secret);
            user.save(function (err, newUser) {
              if (err) {
                http.log(req, 'Internal error: check /sign-up -> create user -> save', err);
                http.response(res, 500, {}, "-1", err);
              } else {
                http.response(res, 200, {user: newUser}, "1");
              }
            });
          })
        }
      });
    });
  });

  /*
   * Me
   */
  app.get(prefix + '/me', http.ensureAuthorized, function (req, res) {
    User.findOne({"identity.token": req.token}).lean().exec(function (err, user) {
      if (err) {
        http.log(req, 'Internal error: check /me', err);
        http.response(res, 500, {}, "-1", err);
      } else if (user) {
        http.response(res, 200, {user: user});
      } else {
        http.log(req, 'Error: user with token (' + req.token + ') not found.');
        http.response(res, 404, {}, "-3");
      }
    });
  });
};
