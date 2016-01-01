'use strict';

var mongoose = require('mongoose');

var Entry = require('./entry').schema;

var ProjectEntry = new mongoose.Schema();
ProjectEntry.add({
  name: {type: String, trim: true, require: true},
  ontime_id: {type: Number, index: true},
  path: [{type: String, trim: true}],
  entries: [Entry],
  children: [ProjectEntry],
});

module.exports = mongoose.model('ProjectEntry', ProjectEntry);