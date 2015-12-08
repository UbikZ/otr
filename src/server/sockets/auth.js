'use strict';

var User = require('../models/user');

var users = {};
var guests = {};

module.exports = function(io, socket, socketMsg) {
  var uuid = guid();
  guests[uuid] = socket.uuid = uuid;
  console.log('Guest ' + socket.uuid + ' connected !');

  socket.on('server.user.connected', function(profile) {
    if (profile) {
      User.findOrCreate(profile, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          users[result._id] = socket.user = result;
          console.log('User ' + socket.user._id + ' (' + socket.user.name.userName + ') connected !');
          socket.emit('client.user.information', socketMsg(result));
          socket.emit('client.user.notify', socketMsg('Welcome ' + socket.user.name.userName, 'info'));
          socket.broadcast.emit('client.user.notify', socketMsg('User ' + socket.user.name.userName + ' connected !', 'warning'));
          io.sockets.emit('client.users.number', socketMsg(Object.keys(users).length));
        }
      });
    } else {
      console.log('Profile given error !');
    }
  });

  socket.on('server.user.disconnected', function() {
    console.log('User ' + socket.user.id + ' (' + socket.user.name.userName + ') disconnected !');
    delete users[socket.user._id];
    socket.broadcast.emit('client.users.number', socketMsg(Object.keys(users).length));
  });

  socket.on('disconnect', function () {
    console.log('Guest ' + socket.uuid + ' disconnected !');
    delete guests[socket.uuid];
  });

  /*
   * Helpers
   */

  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }
};

module.exports.users = users;
module.exports.guests = guests;