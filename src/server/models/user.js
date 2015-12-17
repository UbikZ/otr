'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  identity: {
    token: String,
    ontime_token: String,
  },
  name: {
    username: { type: String, index: { unique: true } },
    firstname: String,
    lastname: String
  },
  info: {
    job: String,
    skype: String,
    location: String,
    organization: {type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
    email: { type: String, index: { unique: true } },
  },
});

module.exports = mongoose.model('User', schema);
