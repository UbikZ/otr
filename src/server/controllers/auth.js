'use strict';

var User = require('../models/user');
var http = require('./helpers/http');
var otrConf = require('../config/ontime.json');
var jwt = require("jsonwebtoken");

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version;

  /*
   * Sigin with OnTime
   */
  app.post(prefix + '/sign-up', function (req, res) {
    http.ontimeRequestToken(req, res, function (userData) {
      User.findOne({"info.email": userData.email}, function (err, user) {
        if (err) {
          http.response(res, 500, {}, "-1", err);
          http.log(req, 'Internal error: check /sign-up.', err);
        } else if (user) {
          user.identity.ontime_token = userData.access_token;
          user.save(function (err, newUser) {
            if (err) {
              http.response(res, 500, {}, "-1", err);
              http.log(req, 'Internal error: check /sign-up -> update user -> save', err);
            } else {
              http.response(res, 200, {user: newUser}, "1");
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
                http.response(res, 500, {}, "-1", err);
                http.log(req, 'Internal error: check /sign-up -> create user -> save', err);
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
    User.findOne({"identity.token": req.token}, function (err, user) {
      if (err) {
        http.response(res, 500, {}, "-1", err);
        http.log(req, 'Internal error: check /me', err);
      } else if (user) {
        http.response(res, 200, {user: user});
      } else {
        http.response(res, 404, {}, "-3");
        http.log(req, 'Error: user with token (' + req.token + ') not found.');
      }
    });
  });

  /*
   * Ontime Me
   */
  app.get(prefix + '/me-ontime', http.ensureAuthorized, function (req, res) {
    http.ontimeMe(req, res, function (userData) {
      http.response(res, 200, {ontime_user: userData});
    });
  });
};
