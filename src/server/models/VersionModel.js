'use strict';

const mongoose = require('mongoose');

const AbstractModel = require('./AbstractModel');

const SettingModel = require('./SettingModel');
const EntryModel = require('./EntryModel');

/**
 * Version Model
 */
class VersionModel extends AbstractModel {
  constructor() {
    super();
    this.modelName = 'Version';
    this.modelStruct = {
      name: { type: String, trim: true, require: true },
      creation: {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        date: Date
      },
      update: {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        date: { type: Date, default: Date.now },
      },
      setting: SettingModel.schema,
      entries: [EntryModel.schema],
    };
    this.register();
  }
}

module.exports = new VersionModel();
