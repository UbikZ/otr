'use strict';

var moment = require('moment');
var merge = require('merge');
var ontimeRequester = require('./ontime');

function response (res, status, data, message, err) {
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

function ensureAuthorized (req, res, next) {
  var bearerToken;
  var bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== 'undefined') {
    var bearer = bearerHeader.split(" ");
    bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

function ontimeRequestToken (req, res, cb) {
  ontimeRequester.requestToken({username: req.body.username, password: req.body.password}, function (result) {
    if (result.error) {
      response(res, 403, {}, result.error_description, result.error);
    } else if (result.access_token != "undefined") {
      cb(JSON.parse(result).data);
    } else {
      response(res, 500, {}, "Internal error during OnTime Request Token.");
    }
  });
}

module.exports = {
  response: response,
  ensureAuthorized: ensureAuthorized,
  ontimeRequestToken: ontimeRequestToken,
};