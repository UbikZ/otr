'use strict';

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');

const User = require('../models/UserModel').model;

const EmptyUserError = require('./../errors/EmptyUserError');

/**
 *  User Controller
 *  - indexAction
 *  - updateAction
 */
class UserController extends AbstractController {

  /**
   * Private method to process the get of users by criteria
   * @param  {Object} criteria Criteria for search on or several users
   * @param  {Object} request
   * @param  {Object} response
   */
  static _processGetUsers(criteria, request, response) {
    return Http.checkAuthorized(request, response)
      .then(() => {
        return User.find(criteria).lean().execAsync();
      })
      .then(users => {
        if (!users) {
          throw new EmptyUserError();
        }
        Http.sendResponse(request, response, 200, { users });
      })
      .catch(EmptyUserError, error => {
        Http.sendResponse(request, response, 404, {}, '-12', 'Error: `users` is undefined.', error);
      })
      .catch(error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: get users', error);
      });
  }

  /**
   * Get users from the application by criteria
   * @param  {Object} request
   * @param  {Object} response
   */
  static indexAction(request, response) {
    UserController._processGetUsers(request.query, request, response);
  }

  /**
   * Get ONE user from the application by his OID (Object ID)
   * @param  {Object} request
   * @param  {Object} response
   */
  static getAction(request, response) {
    UserController._processGetUsers(request.query, request, response);
  }

  /**
   * Update logged user information
   * @param   request
   * @param   response
   * @method  POST
   */
  /**
   * Update logged user
   * @param  {[type]} request  [description]
   * @param  {[type]} response [description]
   * @return {[type]}          [description]
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
      });
  }
}

module.exports = UserController;
