'use strict';

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');

const User = require('../models/UserModel');

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
        return User.model.find(criteria).lean().execAsync();
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
    const parsedParams = User.parseParams(request.query);
    UserController._processGetUsers(parsedParams, request, response);
  }

  /**
   * Get ONE user from the application by his OID (Object ID)
   * @param  {Object} request
   * @param  {Object} response
   */
  static getByIdAction(request, response) {
    const parsedParams = User.parseParams(request.params);
    UserController._processGetUsers(parsedParams, request, response);
  }

  /**
   * Update user by his ID
   * TODO: At this moment, we only update if a user is found with these criteria (userId param is associated to the
   * user with current logged token). So only update for the logged use. We will need to improve this, to enable
   * the update for all use if logged user is allowed to.
   * @param  {Object} request
   * @param  {Object} response
   */
  static updateAction(request, response) {
    const criteria = User.parseParams(request.params);
    criteria['identity.token'] = request.token;

    let userModel = {};

    User.model.findOne(criteria).lean().execAsync()
      .then(user => {
        if (!user) {
          throw new EmptyUserError();
        }
        userModel = User.parseData(user, request.body);
        return User.model.update({ _id: userModel._id }, userModel, {}).lean().execAsync();
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
