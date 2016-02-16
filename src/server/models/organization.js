'use strict';

const mongoose = require('mongoose');
const BPromise = require('bluebird');

const Project = require('./project').schema;
const Setting = require('./setting').schema;
const Find = require('./helpers/Find');

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

/**
 *
 * @param model
 * @param elementId
 * @returns {*|void}
 */
schema.statics.findDeepAttributeById = (model, elementId) => {
  return new BPromise(resolve => {
    Find.findRecursively(model, elementId, (element, parentElement, type) => {
      resolve({element, parentElement, type});
    });
  });
};

/**
 * No promise here (will see after)
 * - hard recursive method (performance needed)
 * @param model
 * @param callback
 */
schema.statics.walkRecursively = (model, callback) => {
  Find.walkRecursively(model, element => {
    if (element !== undefined) {
      callback(element);
    }
  });
};

module.exports = mongoose.model('Organization', schema);