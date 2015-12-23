'use strict';

var mongoose = require('mongoose');
var Setting = require('./setting').schema;
var Document = require('./document').schema;

var Project = new mongoose.Schema();
Project.add({
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
  documents: [Document],
  setting: Setting,
  projects: [Project],
});

module.exports = mongoose.model('Project', Project);