'use strict';

var User = require('../models/user');
var httpRes = require('./helpers/httpRes');
var ontimeRequester = require('./helpers/ontime');

module.exports.controller = function(app, config) {

  /*
   * Authentication to get user token
   */
  app.post('api/v' + config.api.version + '/authenticate', function(req, res) {
    User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
      if (err) {
        httpRes.response(res, 404, {}, "Error occurred", err);
      } else {
        if (user) {
          httpRes.response(res, 404, { user: user, token: user.identity.token }, "Incorrect email/password", err);
        } else {
          httpRes.response(res, 404, {}, "Incorrect email/password", err);
        }
      }
    });
  });

  /*
   * Sigin with OnTime
   */
  app.post('/signin', function(req, res) {
    var reqObject = { username: req.body.username, password: req.body.password };

    console.log(ontimeRequester.requestToken(reqObject));
  });

  app.get('/api/test', function(req, res) {
    var reqObject = { username: 'gmalet', password: 'Gabyfric188' };

    ontimeRequester.requestToken(reqObject, function(obj) {
      console.log(obj);
    });
  });
};
