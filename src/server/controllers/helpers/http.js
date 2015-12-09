'use strict';

var moment = require('moment');
var merge = require('merge');
var ontimeRequester = require('./ontime');

function response(res, status, data, message, err) {
  var dat = merge({
    date: moment().format('YYYY-MM-DD HH:mm:SS'),
    code: status,
    error: err,
    message: message,
    data: {},
  }, data);

  res.status(status);
  res.json(dat);
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
    res.sendStatus(403);
  }
}

function ontimeRequestToken(req, res, cb) {
  ontimeRequester.requestToken({username: req.body.username, password: req.body.password}, function (result) {
    result = JSON.parse(result);
    if (result.error) {
      response(res, 403, {error: result}, result.error_description, result.error);
    } else if (result.access_token) {
      cb(merge(result.data, {access_token: result.access_token}));
    } else {
      response(res, 500, {}, "Internal error during OnTime /authenticate.");
    }
  });
}

function ontimeMe(req, res, cb) {
  ontimeRequester.me(req.ot_token, function (result) {
    result = JSON.parse(result);
    if (result.error) {
      response(res, 403, {error: result}, result.error_description, result.error);
    } else if (result.data) {
      cb(result.data);
    } else {
      response(res, 500, {}, "Internal error during OnTime /me.");
    }
  });
}

module.exports = {
  response: response,
  ensureAuthorized: ensureAuthorized,
  ontimeRequestToken: ontimeRequestToken,
  ontimeMe: ontimeMe,
};