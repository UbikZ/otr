'use strict';

const mongoose = require('mongoose');
const BPromise = require('bluebird');

const Project = require('./project').schema;
const Setting = require('./setting').schema;
const Find = require('./helpers/Find');

const Success = require('../errors/Success');

const schema = new mongoose.Schema({
  name: { type: String, index: { unique: true }, trim: true, require: true },
  description: { type: String, trim: true },
  active: Boolean,
  url: { type: String, trim: true },
  logo: { type: String, trim: true },
  address: {
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    line3: { type: String, trim: true },
    postCode: { type: String, trim: true },
    region: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true }
  },
  creation: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
  },
  update: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
  },
  projects: [Project],
  setting: Setting,
});

/**
 * No promise here (will see after)
 * - hard recursive method (performance needed)
 * @param model
 * @param callback
 */
function walkRecursively(model, callback) {
  Find.walkRecursively(model, element => {
    if (element !== undefined) {
      callback(element);
    }
  });
}

/**
 * Generic save method
 * - update organization
 * - "lazy" for delete entries
 * @param data
 * @param org
 * @param item
 * @param returnCode
 * @returns {*}
*/
function persist(data, org, item, returnCode) {
  const model = mongoose.model('Organization');
  let organization = org;
  return model.update({ _id: organization._id }, organization, { upsert: true }).lean().execAsync()
    .then(() => {
      let returnValue = { organization, item, type: data.type + 's', returnCode };
      /*jshint eqeqeq: false */
      if (data.modePreview == 1) {
        /*jshint eqeqeq: true */
        delete returnValue.organization;
        delete returnValue.type;
        /*jshint eqeqeq: false */
      }
      
      /*jshint eqeqeq: false */
      if (data.lazy == 1) {
        /*jshint eqeqeq: true */
        walkRecursively(organization, element => {
          if (element.entries !== undefined) {
            delete element.entries;
            if (element.entries !== undefined) {
              element.entries = null;
            }
          }
        });
        returnValue.organization = organization;
        delete item.entries;
        if (item.entries !== undefined) {
          item.entries = null;
        }
        returnValue.item = item;
      }
      throw new Success(returnValue);
    })
    ;
}

/**
 *
 * @param model
 * @param elementId
 * @returns {*|void}
 */
function findDeepAttributeById(model, elementId) {
  return new BPromise(resolve => {
    Find.findRecursively(model, elementId, (element, parentElement, type) => {
      resolve({ element, parentElement, type });
    });
  });
}

schema.statics.persist = persist;
schema.statics.findDeepAttributeById = findDeepAttributeById;
schema.statics.walkRecursively = walkRecursively;

module.exports = mongoose.model('Organization', schema);