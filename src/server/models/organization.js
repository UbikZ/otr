'use strict';

var mongoose = require('mongoose');
var Project = require('./project').schema;
var Setting = require('./setting').schema;
var utilsHelper = require('./helpers/utils');

var schema = new mongoose.Schema({
  name: {type: String, index: {unique: true}, trim: true, require: true},
  description: {type: String, trim: true},
  active: Boolean,
  url: {type: String, trim: true},
  logo: {type: String, trim: true},
  address: {
    line1: {type: String, trim: true},
    line2: {type: String, trim: true},
    line3: {type: String, trim: true},
    post_code: {type: String, trim: true},
    region: {type: String, trim: true},
    city: {type: String, trim: true},
    country: {type: String, trim: true}
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
  setting: Setting,
});

schema.methods.findDeepAttributeById = function (elementId, cb) {
  var model = this;

  utilsHelper.findSpecificRecursivelyById(model, elementId, function (element) {
    cb(element);
  });

};

module.exports = mongoose.model('Organization', schema);