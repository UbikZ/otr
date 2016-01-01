'use strict';

var mongoose = require('mongoose');
var Setting = require('./setting').schema;
var ProjectEntry = require('./projectEntry').schema;

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
  entries: [ProjectEntry],
});

module.exports = mongoose.model('Version', Version);