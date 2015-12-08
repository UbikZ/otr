'use strict';

module.exports = function(io, socket, socketMsg) {

  socket.on('server.chat.push.message', function(data) {
    io.sockets.emit('client.chat.push.message', socketMsg(data));
  });
};