'use strict';

const jwt = require('jsonwebtoken');

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');
const User = require('../models/user');
const otrConf = require('../config/ontime');

const EmptyUserError = require('../errors/EmptyUserError');

/**
 * Authentication controller
 * - signUpAction
 * - meAction
 */
class AuthenticationController extends AbstractController {
  /**
   * Register or connect a user
   * - Get new Ontime token (for each sign-up)
   * - Persist it in mongo database
   * @param   request
   * @param   response
   * @method  POST
   */
  signUpAction(request, response) {
    Http.ontimeRequestToken(request, response, userData => {
      let userModel = {};
      User.findOne({'info.email': userData.email}).lean().execAsync()
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
            userModel.name.username = request.body.username;
            /*jshint camelcase: false */
            userModel.name.firstname = userData.first_name;
            userModel.name.lastname = userData.last_name;
            /*jshint camelcase: true */
            options.upsert = true;
          }
          return User.update({_id: userModel._id}, userModel, options).lean().execAsync();
        })
        .then(() => {
          Http.sendResponse(request, response, 200, {user: userModel}, '1');
        })
        .catch(err => {
          Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: check /sign-up.', err);
        })
      ;
    });
  }

  /**
   * Get Ontime information about logged user
   * @param   request
   * @param   response
   * @method  GET
   */
  meAction(request, response) {
    User.findOne({'identity.token': request.token}).lean().execAsync()
      .then(user => {
        if (!user) {
          throw new EmptyUserError();
        }
        Http.sendResponse(request, response, 200, {user: user});
      })
      .catch(EmptyUserError, () => {
        Http.sendResponse(request, response, 404, {}, '-3', 'Error: token (' + request.token + ') not found.');
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: check /me', err);
      })
    ;
  }

  /**
   * Controller Name
   * @returns {string}
   */
  static get patternUrl() {
    return '/auth';
  }
}

module.exports = AuthenticationController;
