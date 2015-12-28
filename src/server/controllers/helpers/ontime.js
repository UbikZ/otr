'use strict';

var request = require('request');
var qs = require('querystring');
var ontimeConfig = require('../../config/ontime.json');

function req(url, cb) {
  request(url, function (error, response, body) {
    console.log('# Ontime Call : ' + url);
    if (error && response.statusCode != 200) {
      console.log('Error while requesting (' + url + ').');
    }
    cb(body);
  });
}

function requestToken(authObject, cb) {
  var url = ontimeConfig.ontime_url + '/api/oauth2/token?' +
    qs.stringify({
      'grant_type': 'password',
      'username': authObject.username,
      'password': authObject.password,
      'client_id': ontimeConfig.client_id,
      'client_secret': ontimeConfig.client_secret,
      'scope': ontimeConfig.scope,
    });

  req(url, cb);
}

function me(accessToken, cb) {
  var url = ontimeConfig.ontime_url + '/api/v5/me?' +
    qs.stringify({
      'access_token': accessToken,
    });

  req(url, cb);
}

function tree(accessToken, cb) {
  var url = ontimeConfig.ontime_url + '/api/v5/projects?' +
    qs.stringify({
      'access_token': accessToken,
    });

  req(url, cb);
}

module.exports = {
  requestToken: requestToken,
  me: me,
  tree: tree,
};