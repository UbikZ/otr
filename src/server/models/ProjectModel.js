'use strict';

const mongoose = require('mongoose');

const AbstractModel = require('./AbstractModel');

const SettingModel = require('./SettingModel');
const DocumentModel = require('./DocumentModel');

/**
 * Project Model
 */
class ProjectModel extends AbstractModel {
  constructor() {
    super();
    this.modelName = 'Project';
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
      documents: [DocumentModel.schema],
      setting: SettingModel.schema,
      projects: [this.modelSchema],
    };
    this.register();
  }
}

module.exports = new ProjectModel();
