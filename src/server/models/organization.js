'use strict';

const mongoose = require('mongoose');
const Project = require('./project').schema;
const Setting = require('./setting').schema;
const utilsHelper = require('./helpers/utils');

const schema = new mongoose.Schema({
  name: {type: String, index: {unique: true}, trim: true, require: true},
  description: {type: String, trim: true},
  active: Boolean,
  url: {type: String, trim: true},
  logo: {type: String, trim: true},
  address: {
    line1: {type: String, trim: true},
    line2: {type: String, trim: true},
    line3: {type: String, trim: true},
    postCode: {type: String, trim: true},
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

// FIXME: try to use only promises (NO CALLBACKS)
schema.statics.findDeepAttributeById = (model, elementId, cb) => {
  utilsHelper.findSpecificRecursivelyById(model, elementId, (element, parentElement, type) => {
    cb(element, parentElement, type);
  });
};

// FIXME: try to use only promises (NO CALLBACKS)
schema.statics.walkRecursively = (model, cb) => {
  utilsHelper.walkRecursively(model, (element) => {
    if (element !== undefined) {
      cb(element);
    }
  });
};

module.exports = mongoose.model('Organization', schema);