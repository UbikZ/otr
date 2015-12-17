'use strict';

var mongoose = require('mongoose');
var Project = require('./project').schema;
var Setting = require('./setting').schema;
var utilsHelper = require('./helpers/utils');

var schema = new mongoose.Schema({
  name: { type: String, index: { unique: true }},
  description: String,
  active: Boolean,
  url: String,
  logo: String,
  address: {
    line1: String,
    line2: String,
    line3: String,
    post_code: String,
    region: String,
    city: String,
    country: String
  },
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

schema.methods.findDeepAttributeById = function (projectId, attributesName, cb) {
  var model = this;

  attributesName.forEach(function(attributeName) {
    utilsHelper.findRecursivelyById(model, attributeName, projectId, function (element) {
      cb(element);
    });
  });
};

module.exports = mongoose.model('Organization', schema);