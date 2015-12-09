'use strict';

var request = require('request');
var qs = require('querystring');
var ontimeConfig = require('../../config/ontime.json');

module.exports = {
  requestToken: function (authObject, cb) {
    var url = ontimeConfig.ontime_url + '/api/oauth2/token?' +
      qs.stringify({
        'grant_type': 'password',
        'username': authObject.username,
        'password': authObject.password,
        'client_id': ontimeConfig.client_id,
        'client_secret': ontimeConfig.client_secret,
        'scope': ontimeConfig.scope,
      });

    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        cb(body);
      } else {
        console.log('Error while requesting (' + url + ').');
      }
    });
  }
};