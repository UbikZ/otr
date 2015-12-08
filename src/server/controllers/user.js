'use strict';

var User = require('../models/user');
var httpRes = require('./helpers/httpRes');
var socket = require('./helpers/socket');

module.exports.controller = function(app, io, config) {
  app.post('/user', function (req, res) {
    User.findByIdAndUpdate(req.body, function(err, result) {
      if (err) {
        httpRes.sendJSON(res, 404, {}, err);
      } else {
        var socketInstance = socket.getSocket(io, result._id);
        socketInstance.user = result;
        httpRes.sendJSON(res, 200, { user: result }, err);
      }
    });
  });
};
