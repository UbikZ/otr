'use strict';

const mongoose = require('mongoose');
const Setting = require('./setting').schema;
const Entry = require('./entry').schema;

const Version = new mongoose.Schema();
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
  entries: [Entry],
});

module.exports = mongoose.model('Version', Version);