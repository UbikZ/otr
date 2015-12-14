'use strict';

var mongoose = require('mongoose');
var Setting = require('./setting').schema;
var Document = require('./document').schema;

var Project = new mongoose.Schema();
Project.add({
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
  projects: [Project],
  documents: [Document],
  settings: Setting,
});

Project.index({name: 1}, {unique: true});

module.exports = mongoose.model('Project', Project);