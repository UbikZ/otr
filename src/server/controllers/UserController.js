'use strict';

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');
const User = require('../models/user');

const EmptyUserError = require('./../errors/EmptyUserError');

/**
 *  User Controller
 *  - indexAction
 *  - updateAction
 */
class UserController extends AbstractController {
  /**
   * Get information about logged ontime user
   * @param   request
   * @param   response
   * @method  GET
   */
  static indexAction(request, response) {
    Http.checkAuthorized(request, response)
      .then(() => {
        return User.find({}).lean().execAsync();
      })
      .then(users => {
        if (!users) {
          throw new EmptyUserError();
        }
        Http.sendResponse(request, response, 200, { users: users });
      })
      .catch(EmptyUserError, error => {
        Http.sendResponse(request, response, 404, {}, '-12', 'Error: users is undefined (criteria = {}).', error);
      })
      .catch(error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: get users', error);
      })
    ;
  }

  /**
   * Update logged user information
   * @param   request
   * @param   response
   * @method  POST
   */
  static updateAction(request, response) {
    const data = request.body;
    let userModel = {};

    User.findOne({ 'identity.token': request.token }).lean().execAsync()
      .then(user => {
        userModel = user;
        if (!user) {
          throw new EmptyUserError();
        }
        if (data.firstname) {
          userModel.name.firstname = data.firstname;
        }
        if (data.lastname) {
          userModel.name.lastname = data.lastname;
        }
        if (data.skype) {
          userModel.info.skype = data.skype;
        }
        if (data.location) {
          userModel.info.location = data.location;
        }
        if (data.job) {
          userModel.info.job = data.job;
        }
        return User.update({ _id: userModel._id }, userModel, {}).lean().execAsync();
      })
      .then(() => {
        Http.sendResponse(request, response, 200, { user: userModel }, '11');
      })
      .catch(EmptyUserError, error => {
        Http.sendResponse(
          request, response, 404, {}, '-12', 'User with token(' + request.token + ') not found', error
          );
      })
      .catch(error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: update user', error);
      })
    ;
  }
}

module.exports = UserController;