'use strict';

var mongoose = require('mongoose');
var Setting = require('./setting').schema;
var Version = require('./version').schema;

var DocumentSchema = new mongoose.Schema();
DocumentSchema.add({
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
  setting: Setting,
  versions: [Version],
});

module.exports = mongoose.model('Document', DocumentSchema);