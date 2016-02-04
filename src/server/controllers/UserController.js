'use strict';

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');
const Ontime = require('./helpers/Ontime');
const User = require('../models/user');

const EmptyUserError = require('./../Errors/EmptyUserError');

/**
 *
 */
class UserController extends AbstractController {
  /**
   * @param config
   */
  constructor(config) {
    super(config);
    this.apiCtrlName = '/user';
  }

  /**
   * Get information about logged ontime user
   * @param   request
   * @param   response
   * @method  GET
   */
  indexAction(request, response) {
    Http.checkAuthorized(request, response, () => {
      Ontime.me(request.ontimeToken, result => {
        result = JSON.parse(result);
        if (result.error) {
          /*jshint camelcase: false */
          Http.sendResponse(
            request, response, 403, {error: result}, '-3', 'Ontime Error: ' + result.error_description, result.error
          );
          /*jshint camelcase: true */
        } else if (result.data) {
          Http.sendResponse(request, response, 200, {ontimeUser: result.data});
        } else {
          Http.sendResponse(request, response, 500, {}, '-1', 'Ontime Error: issue during OnTime "/me" request');
        }
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
}

module.exports = UserController;