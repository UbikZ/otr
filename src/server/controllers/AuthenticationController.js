'use strict';

const merge = require('merge');

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');
const User = require('../models/UserModel');

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
    let userModel = {},
      data = {};
    Http.ontimeRequestToken(request, response)
      .then(userData => {
        data = userData;
        return User.model.findOne({ 'info.email': userData.email }).lean().execAsync();
      })
      .then(user => {
        let options = {};

        userModel = user || new User.model();
        userModel.identity.ontimeToken = data.accessToken;
        if (!user) {
          User.parseDataFromOntime(userModel, merge(data, request.body));
          options.upsert = true;
        }
        return User.model.update({ _id: userModel._id }, userModel, options).lean().execAsync();
      })
      .then(() => {
        Http.sendResponse(request, response, 200, { user: userModel }, '1');
      })
      .catch(error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: check /sign-up.', error);
      });
  }

  /**
   * Get Ontime information about logged user
   * @param   request
   * @param   response
   * @method  GET
   */
  static meAction(request, response) {
    User.model.findOne({ 'identity.token': request.token }).lean().execAsync()
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
      });
  }
}

module.exports = AuthenticationController;
