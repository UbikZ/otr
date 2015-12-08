'use strict';

module.exports = {
  getSocket: function(io, id) {
    var result = "test";
    io.sockets.sockets.forEach(function(socket) {
      if (socket.user._id.toString() == id.toString()) {
        result = socket;
      }
    });

    return result;
  }
};
