'use strict';

var User = require('../models/user');
var http = require('./helpers/http');
var otrConf = require('../config/ontime.json');
var jwt = require("jsonwebtoken");

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version + '/user';

  /*
   * Update user
   */
  app.post(prefix + '/update', http.ensureAuthorized, function (req, res) {
    var data = req.body;
    User.findOne({"identity.token": req.token}, function (err, user) {
      if (err) {
        http.response(res, 500, "An error occurred.", err);
      } else if (user) {
        if (data.firstname) {
          user.name.firstname = data.firstname;
        }
        if (data.lastname) {
          user.name.lasntame = data.lastname;
        }
        if (data.job) {
          user.info.job = data.job;
        }
        user.save(function (err, newUser) {
          if (err) {
            http.response(res, 500, {}, "An error occurred.", err);
          } else {
            http.response(res, 200, {user: newUser});
          }
        });
      } else {
        http.response(res, 404, {}, "User not found.", err);
      }
    });
  });
};
