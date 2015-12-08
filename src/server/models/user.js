'use strict';

var mongoose = require('mongoose');

module.exports = (function() {
  var schema = new mongoose.Schema({
    id: String,
    identity: {
      token: String,
    },
    name: {
      userName: String,
      firstName: String,
      lastName: String
    },
    info: {
      job: String,
      email: String,
    },
  });

  return mongoose.model('User', schema);
})();