'use strict';

var moment = require('moment');
var merge = require('merge');
var ontimeRequester = require('./ontime');
var User = require('../../models/user');
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
  var bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== 'undefined') {
    var bearer = bearerHeader.split(" ");
    bearerToken = bearer[1];
    bearerOtToken = bearer[2];
    req.token = bearerToken;
    req.ot_token = bearerOtToken;
    next();
  } else {
    log(req, 'No bearer header provided');
    res.sendStatus(403);
  }
}

function checkAuthorized(req, res, cb) {
  User.findOne({"identity.token": req.token}).lean().exec(function (err, user) {
    if (err) {
      log(req, 'Internal error: check authorization.', err);
      response(res, 500, {}, "-1", err);
    } else if (user) {
      cb(user);
    } else {
      log(req, 'Error: token provided is not associated with an account.', err);
      response(res, 404, {}, "-2", err);
    }
  });
}

function ontimeRequestToken(req, res, cb) {
  ontimeRequester.requestToken({username: req.body.username, password: req.body.password}, function (result) {
    result = JSON.parse(result);
    if (result.error) {
      log(req, 'Ontime Error: ' + result.error_description);
      response(res, 403, {error: result}, "-3", result.error);
    } else if (result.access_token) {
      cb(merge(result.data, {access_token: result.access_token}));
    } else {
      log(req, 'Ontime Error: issue during OnTime "/authenticate" request');
      response(res, 500, {}, "-1");
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