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
  static signUpAction(request, response) {
    let userModel = {}, data = {};
    Http.ontimeRequestToken(request, response)
      .then(userData => {
        data = userData;
        return User.findOne({ 'info.email': userData.email }).lean().execAsync();
      })
      .then(user => {
        let options = {};
        if (user) {
          userModel = user;
          userModel.identity.ontimeToken = data.accessToken;
        } else {
          userModel = new User();
          userModel.identity.ontimeToken = data.accessToken;
          userModel.identity.token = jwt.sign(userModel._id, otrConf.jwtSecret);
          userModel.info.email = data.email;
          userModel.name.username = request.body.username;
          /*jshint camelcase: false */
          userModel.name.firstname = data.first_name;
          userModel.name.lastname = data.last_name;
          /*jshint camelcase: true */
          options.upsert = true;
        }
        return User.update({ _id: userModel._id }, userModel, options).lean().execAsync();
      })
      .then(() => {
        Http.sendResponse(request, response, 200, { user: userModel }, '1');
      })
      .catch(error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: check /sign-up.', error);
      })
    ;
  }

  /**
   * Get Ontime information about logged user
   * @param   request
   * @param   response
   * @method  GET
   */
  static meAction(request, response) {
    User.findOne({ 'identity.token': request.token }).lean().execAsync()
      .then(user => {
        if (!user) {
          throw new EmptyUserError();
        }
        Http.sendResponse(request, response, 200, { user: user });
      })
      .catch(EmptyUserError, error => {
        Http.sendResponse(request, response, 404, {}, '-3', 'Error: token (' + request.token + ') not found.', error);
      })
      .catch(error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: check /me', error);
      })
    ;
  }
}

module.exports = AuthenticationController;
