'use strict';

var mongoose = require('mongoose');
var Project = require('./project').schema;
var Setting = require('./setting').schema;
var utilsHelper = require('./helpers/utils');

var schema = new mongoose.Schema({
  name: String,
  description: String,
  active: Boolean,
  url: String,
  logo: String,
  creation: {
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: {type: Date, default: Date.now},
  },
  update: {
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: {type: Date, default: Date.now},
  },
  projects: [Project],
  settings: Setting,
});

schema.index({name: 1}, {unique: true});

schema.statics.findDeepAttributeById = function (projectId, attributeName, cb) {
  var model = this;

  utilsHelper.findRecursivelyById(model, attributeName, projectId, function (element) {
    cb(element);
  });
};

module.exports = mongoose.model('Organization', schema);