'use strict';

var moment = require('moment');
var merge = require('merge');
var User = require('../../models/user');
var ontimeRequester = require('./ontime');
var logger = require('../../logger');

function response(res, status, data, message, err) {
  var dat = merge({
    date: moment().format('YYYY-MM-DD HH:mm:SS'),
    code: status,
    error: err,
    messageCode: message,
    data: {},
  }, data);

  res.status(status).json(dat);
}

function log(req, message, err) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  logger.debug('*** ' + ip + ' ***');
  logger.debug('[' + moment().format('YYYY-MM-DD HH:mm:SS') + '] Msg: ' + message);
  if (err) {
    logger.debug('[' + moment().format('YYYY-MM-DD HH:mm:SS') + '] Err: ' + err);
  }
  logger.debug('******');
}

function ensureAuthorized(req, res, next) {
  var bearerToken, bearerOtToken;
  var bearerHeader = req.headers.authorization || req.query.authorization;
  if (typeof bearerHeader !== 'undefined') {
    var bearer = bearerHeader.split(' ');
    bearerToken = bearer[1];
    bearerOtToken = bearer[2];
    req.token = bearerToken;
    req.ontimeToken = bearerOtToken;
    next();
  } else {
    log(req, 'No bearer header provided');
    response(res, 403, {}, '-3');
  }
}

function checkAuthorized(req, res, cb) {
  User.findOne({ 'identity.token': req.token }).lean().exec(function (err, user) {
    if (err) {
      log(req, 'Internal error: check authorization.', err);
      response(res, 500, {}, '-1', err);
    } else if (user) {
      cb(user);
    } else {
      log(req, 'Error: token provided is not associated with an account.', err);
      response(res, 404, {}, '-2');
    }
  });
}

function ontimeRequestToken(req, res, cb) {
  ontimeRequester.requestToken({ username: req.body.username, password: req.body.password }, function (result) {
    result = JSON.parse(result);
    if (result.error) {
      /*jshint camelcase: false */
      log(req, 'Ontime Error: ' + result.error_description);
      /*jshint camelcase: true */
      response(res, 403, { error: result }, '-3', result.error);
      /*jshint camelcase: false */
    } else if (result.access_token) {
      cb(merge(result.data, { accessToken: result.access_token }));
      /*jshint camelcase: true */
    } else {
      log(req, 'Ontime Error: issue during OnTime "/authenticate" request');
      response(res, 500, {}, '-1');
    }
  });
}

module.exports = {
  response: response,
  log: log,
  ensureAuthorized: ensureAuthorized,
  checkAuthorized: checkAuthorized,
  ontimeRequestToken: ontimeRequestToken,
};
