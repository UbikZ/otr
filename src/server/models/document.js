'use strict';

var mongoose = require('mongoose');
var Setting = require('./setting').schema;

var schema = new mongoose.Schema({
  name: String,
  description: String,
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

schema.index({name: 1}, {unique: true});

module.exports = mongoose.model('Document', schema);