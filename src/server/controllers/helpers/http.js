'use strict';

const moment = require('moment');
const merge = require('merge');
var Promise = require('bluebird');

const User = require('../../models/user');
const OntimeRequester = require('./Ontime');
const logger = require('../../logger');

const EmptyUserError = require('../../errors/EmptyUserError');

/**
 * Http helper to handle requests, responses, logging etc.
 */
class Http {
  /**
   * Global method to send and log a formated/standard json object response
   * @param request
   * @param res
   * @param status
   * @param data
   * @param msgCode
   * @param msgLog
   * @param err
   */
  static sendResponse(request, res, status, data, msgCode, msgLog, err) {
    if (status !== 200) {
      Http.log(request, msgLog, err);
    }
    Http.response(res, status, data, msgCode, err);
  }

  /**
   * Global method to send a formated/standard json object response
   * @param response
   * @param status
   * @param data
   * @param message
   * @param err
   */
  static response(response, status, data, message, err) {
    const dat = merge({
      date: moment().format('YYYY-MM-DD HH:mm:SS'),
      code: status,
      error: err,
      messageCode: message,
      data: {},
    }, data);

    response.status(status).json(dat);
  }

  /**
   * Global method to log any message from the application
   * @param request
   * @param message
   * @param err
   */
  static log(request, message, err) {
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    logger.debug('*** ' + ip + ' ***');
    logger.debug('[' + moment().format('YYYY-MM-DD HH:mm:SS') + '] Msg: ' + message);
    if (err) {
      logger.debug('[' + moment().format('YYYY-MM-DD HH:mm:SS') + '] Err: ' + err);
    }
    logger.debug('******');
  }

  /**
   * Global method to check http headers sent (or get param)
   * @param request
   * @param response
   * @param next
   */
  static ensureAuthorized(request, response, next) {
    let bearerToken, bearerOtToken;
    const bearerHeader = request.headers.authorization || request.query.authorization;
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      bearerToken = bearer[1];
      bearerOtToken = bearer[2];
      request.token = bearerToken;
      request.ontimeToken = bearerOtToken;
      next();
    } else {
      Http.sendResponse(request, response, 403, {}, '-3', 'No bearer header provided');
    }
  }

  /**
   * Global method to check authorization to access a method
   * @param request
   * @param response
   * @returns {*}
   */
  static checkAuthorized(request, response) {
    return User.findOne({'identity.token': request.token}).lean().execAsync()
      .then(user => {
        if (!user) {
          throw new EmptyUserError();
        }
        return new Promise(resolve => {
          resolve(user);
        });
      })
      .catch(EmptyUserError, () => {
        Http.sendResponse(request, response, 404, {}, '-2', 'Error: token provided is not associated with an account.');
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Internal error: check authorization.', err);
      })
    ;
  }

  /**
   * Global method to request a token from OnTime service
   * @param request
   * @param response
   * @param callback
   */
  static ontimeRequestToken(request, response, callback) {
    OntimeRequester.requestToken({username: request.body.username, password: request.body.password}, result => {
      result = JSON.parse(result);
      if (result.error) {
        /*jshint camelcase: false */
        Http.sendResponse(
          request, response, 403, {error: result}, '-3', 'Ontime Error: ' + result.error_description, result.error
        );
      } else if (result.access_token) {
        callback(merge(result.data, {accessToken: result.access_token}));
        /*jshint camelcase: true */
      } else {
        Http.sendResponse(
          request, response, 500, {}, '-1', 'Ontime Error: issue during OnTime "/authenticate" request'
        );
      }
    });
  }
}

module.exports = Http;




