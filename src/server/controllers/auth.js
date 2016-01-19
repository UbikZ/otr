'use strict';

var User = require('../models/user');
var otrConf = require('../config/ontime.json');
var jwt = require("jsonwebtoken");
var http = require('./helpers/http');

module.exports.controller = function (app, config) {

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
          User.update({_id: user._id}, user, {}).lean().exec(function (err, raw) {
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
          userModel.identity.token = jwt.sign(userModel._id, otrConf.jwt_secret);
          userModel.info.email = userData.email;
          userModel.name.username = req.body.username;
          userModel.name.firstname = userData.first_name;
          userModel.name.lastname = userData.last_name;
          User.update({_id: userModel._id}, userModel, {upsert: true}).lean().exec(function (err, raw) {
            if (err) {
              http.log(req, 'Internal error: check /sign-up -> create user -> save 1', err);
              http.response(res, 500, {}, "-1", err);
            } else {
              http.response(res, 200, {user: userModel}, "1");
            }
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
