'use strict';

const mongoose = require('mongoose');

const AbstractModel = require('./AbstractModel');
const SettingModel = require('./SettingModel');
const VersionModel = require('./VersionModel');

/**
 * Document Model
 */
class DocumentModel extends AbstractModel {
  constructor() {
    super();
    this.modelName = 'Document';
    this.modelStruct = {
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
      setting: SettingModel.schema,
      versions: [VersionModel.schema],
    };
    this.register();
  }
}

module.exports = new DocumentModel();
