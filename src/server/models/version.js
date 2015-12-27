'use strict';

var mongoose = require('mongoose');
var Setting = require('./setting').schema;

var Version = new mongoose.Schema();
Version.add({
  name: {type: String, trim: true, require: true},
  creation: {
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: Date
  },
  update: {
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: {type: Date, default: Date.now},
  },
  setting: Setting,
  // todo: add entry here
});

module.exports = mongoose.model('Version', Version);