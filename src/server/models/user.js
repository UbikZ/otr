'use strict';

var mongoose = require('mongoose');

module.exports = (function() {
  var schema = new mongoose.Schema({
    id: String,
    identity: {
      token: String,
    },
    name: {
      username: String,
      firstname: String,
      lastname: String
    },
    info: {
      job: String,
      email: String,
    },
  });

  return mongoose.model('User', schema);
})();