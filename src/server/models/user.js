'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  identity: {
    token: String,
    ontime_token: String,
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

schema.index({username: 1}, {unique: true});
schema.index({email: 1}, {unique: true});

module.exports = mongoose.model('User', schema);
