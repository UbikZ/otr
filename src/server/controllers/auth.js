'use strict';

var User = require('../models/user');
var http = require('./helpers/http');
var otrConf = require('../config/ontime.json');
var jwt = require("jsonwebtoken");

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version;

  /*
   * Authentication to get user token
   */
  app.post(prefix + '/authenticate', function (req, res) {
    http.ontimeRequestToken(req, res, function (userData) {
      User.findOne({email: userData.email}, function (err, user) {
        if (err) {
          http.response(res, 500, {}, "An error occurred.", err);
        } else if (user) {
          http.response(res, 200, {user: user, token: user.identity.token});
        } else {
          http.response(res, 404, {}, "Incorrect email/password.", err);
        }
      });
    });
  });

  /*
   * Sigin with OnTime
   */
  app.post(prefix + '/signin', function (req, res) {
    http.ontimeRequestToken(req, res, function (userData) {
      User.findOne({"info.email": userData.email}, function (err, user) {
        if (err) {
          http.response(res, 500, {}, "An error occurred.", err);
        } else if (user) {
          http.response(res, 404, {}, "User already exists.", err);
        } else {
          var userModel = new User();
          userModel.info.email = userData.email;
          userModel.name.username = req.body.username;
          userModel.name.firstname = userData.first_name;
          userModel.name.lastname = userData.last_name;
          userModel.save(function (err, user) {
            user.identity.token = jwt.sign(user, otrConf.jwt_secret);
            user.save(function (err, newUser) {
              http.response(res, 200, {user: newUser});
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
    console.log(req.token);
    User.findOne({"identity.token": req.token}, function (err, user) {
      if (err) {
        http.response(res, 500, "An error occurred.", err);
      } else if (user) {
        http.response(res, 200, {user: user});
      } else {
        http.response(res, 404, {}, "User not found.", err);
      }
    });
  });
};
