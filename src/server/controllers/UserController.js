'use strict';

const promise = require('bluebird');

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');
const Ontime = require('./helpers/Ontime');
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
  indexAction(request, response) {
    Http.checkAuthorized(request, response, () => {
      User.find({}).lean().execAsync()
        .then(users => {
          if (!users) {
            throw new EmptyUserError();
          }
          Http.sendResponse(request, response, 200, {users: users});
        })
        .catch(EmptyUserError, () => {
          Http.sendResponse(request, response, 404, {}, '-12', 'Error: users is undefined (criteria = ' + {} + ').');
        })
        .catch(err => {
          Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: get users', err);
        });
    });
  }

  /**
   * Update logged user information
   * @param   request
   * @param   response
   * @method  POST
   */
  updateAction(request, response) {
    const data = request.body;
    User.findOne({'identity.token': request.token}).lean().execAsync()
      .then(user => {
        if (!user) {
          throw new EmptyUserError({});
        }
        if (data.firstname) {
          user.name.firstname = data.firstname;
        }
        if (data.lastname) {
          user.name.lastname = data.lastname;
        }
        if (data.skype) {
          user.info.skype = data.skype;
        }
        if (data.location) {
          user.info.location = data.location;
        }
        if (data.job) {
          user.info.job = data.job;
        }
        return User.update({_id: user._id}, user, {}).lean().execAsync();
      })
      .then(user => {
        if (!user) {
          throw new EmptyUserError();
        }
        Http.sendResponse(request, response, 200, {user: user}, '11');
      })
      .catch(EmptyUserError, () => {
        Http.sendResponse(request, response, 404, {}, '-12');
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: update user', err);
      })
    ;
  }

  /**
   * Controller Name
   * @returns {string}
   */
  static get patternUrl() {
    return '/user';
  }
}

module.exports = UserController;