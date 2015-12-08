'use strict';

var moment = require('moment');

var users = {};
var guests = {};

module.exports = function(io, conf) {
  io.on('connection', function(socket) {

    var authModule = require('./auth');
    authModule(io, socket, socketMsg);
    users = authModule.users;
    guests  = authModule.guest;

    var chatModule = require('./chat');
    chatModule(io, socket, socketMsg);

    /*
     * Helpers
     */

    function socketMsg(content, type) {
      var ret = {
        date: moment().format('YYYY-MM-DD HH:mm:SS'),
        type: type,
        guest: socket.uuid,
        message: content
      };

      if (socket.user) {
        ret.user = socket.user
      }

      return ret;
    }
  });
};