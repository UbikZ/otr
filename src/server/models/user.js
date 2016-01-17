'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  identity: {
    token: String,
    ontime_token: String,
  },
  name: {
    username: {type: String, index: {unique: true}},
    firstname: {type: String, trim: true},
    lastname: {type: String, trim: true},
  },
  info: {
    job: {type: String, trim: true},
    skype: {type: String, trim: true},
    location: {type: String, trim: true},
    organization: {type: mongoose.Schema.Types.ObjectId, ref: 'Organization'},
    email: {type: String, index: {unique: true}, require: true},
  },
});

module.exports = mongoose.model('User', schema);
