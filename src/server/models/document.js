'use strict';

var mongoose = require('mongoose');
var Setting = require('./setting').schema;

var schema = new mongoose.Schema({
  name: {type: String, trim: true, require: true},
  description: {type: String, trim: true},
  priority: {type: Number, min: 0, max: 2},
  creation: {
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: Date
  },
  update: {
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: {type: Date, default: Date.now},
  },
  // todo: add properties
  settings: Setting,
});

module.exports = mongoose.model('Document', schema);