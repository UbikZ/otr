'use strict';

const User = require('../models/user');
const otrConf = require('../config/ontime.json');
const jwt = require('jsonwebtoken');
const http = require('./helpers/http');

/**
 * Authentication controller
 * @param app
 * @param config
 */
module.exports.controller = (app, config) => {

  const prefix = '/api/v' + config.api.version;

  /**
   * Register or connect a user
   * - Get new Ontime token (for each sign-up)
   * - Persist it in mongo database
   */
  app.post(prefix + '/sign-up', (req, res) => {
    http.ontimeRequestToken(req, res, userData => {
      let userModel = {};
      User.findOne({ 'info.email': userData.email }).lean().execAsync()
        .then(user => {
          let options = {};
          if (user) {
            userModel = user;
            userModel.identity.ontimeToken = userData.accessToken;
          } else {
            userModel = new User();
            userModel.identity.ontimeToken = userData.accessToken;
            userModel.identity.token = jwt.sign(userModel._id, otrConf.jwtSecret);
            userModel.info.email = userData.email;
            userModel.name.username = req.body.username;
            /*jshint camelcase: false */
            userModel.name.firstname = userData.first_name;
            userModel.name.lastname = userData.last_name;
            /*jshint camelcase: true */
            options.upsert = true;
          }
          return User.update({ _id: userModel._id }, userModel, options).lean().exec();
        })
        .then(() => {
          http.response(res, 200, { user: userModel }, '1');
        })
        .catch(err => {
          http.log(req, 'Internal error: check /sign-up.', err);
          http.response(res, 500, {}, '-1', err);
        });
    });
  });

  /**
   * Get Ontime information about logged user
   */
  app.get(prefix + '/me', http.ensureAuthorized, (req, res) => {
    User.findOne({ 'identity.token': req.token }).lean().execAsync()
      .then(user => {
        if (user) {
          http.response(res, 200, { user: user });
        } else {
          http.log(req, 'Error: user with token (' + req.token + ') not found.');
          http.response(res, 404, {}, '-3');
        }
      })
      .catch(err => {
        http.log(req, 'Internal error: check /me', err);
        http.response(res, 500, {}, '-1', err);
      });
  });
};
