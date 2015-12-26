'use strict';

var moment = require('moment');
var merge = require('merge');
var ontimeRequester = require('./ontime');
var User = require('../../models/user');

function response(res, status, data, message, err) {
  var dat = merge({
    date: moment().format('YYYY-MM-DD HH:mm:SS'),
    code: status,
    error: err,
    messageCode: message,
    data: {},
  }, data);

  res.status(status);
  res.json(dat);
}

function log(req, message, err) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log('*** ' + ip + ' ***');
  console.log('[' + moment().format('YYYY-MM-DD HH:mm:SS') + '] Msg: ' + message);
  if (err) {
    console.log('[' + moment().format('YYYY-MM-DD HH:mm:SS') + '] Err: ' + err);
  }
  console.log('******');
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
  User.findOne({"identity.token": req.token}, function (err, user) {
    if (err) {
      response(res, 500, {}, "-1", err);
      log(req, 'Internal error: check authorization.', err);
    } else if (user) {
      cb(user);
    } else {
      response(res, 404, {}, "-2", err);
      log(req, 'Error: token provided is not associated with an account.', err);
    }
  });
}

function ontimeRequestToken(req, res, cb) {
  ontimeRequester.requestToken({username: req.body.username, password: req.body.password}, function (result) {
    result = JSON.parse(result);
    if (result.error) {
      response(res, 403, {error: result}, "-3", result.error);
      log(req, 'Ontime Error: ' + result.error_description);
    } else if (result.access_token) {
      cb(merge(result.data, {access_token: result.access_token}));
    } else {
      response(res, 500, {}, "-1");
      log(req, 'Ontime Error: issue during OnTime "/authenticate" request');
    }
  });
}

function ontimeMe(req, res, cb) {
  ontimeRequester.me(req.ot_token, function (result) {
    result = JSON.parse(result);
    if (result.error) {
      response(res, 403, {error: result}, "-3", result.error);
      log(req, 'Ontime Error: ' + result.error_description);
    } else if (result.data) {
      cb(result.data);
    } else {
      response(res, 500, {}, "-1");
      log(req, 'Ontime Error: issue during OnTime "/me" request');
    }
  });
}

module.exports = {
  response: response,
  ensureAuthorized: ensureAuthorized,
  checkAuthorized: checkAuthorized,
  ontimeRequestToken: ontimeRequestToken,
  ontimeMe: ontimeMe,
};