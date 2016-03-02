'use strict';

const mongoose = require('mongoose');
const Setting = require('./setting').schema;
const DocumentSchema = require('./document').schema;

const Project = new mongoose.Schema();
Project.add({
  name: { type: String, trim: true, require: true },
  description: { type: String, trim: true },
  priority: { type: Number, min: 0, max: 2 },
  creation: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date,
  },
  update: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
  },
  documents: [DocumentSchema],
  setting: Setting,
  projects: [Project],
});

module.exports = mongoose.model('Project', Project);
