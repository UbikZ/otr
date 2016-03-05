'use strict';

const mongoose = require('mongoose');

const AbstractModel = require('./AbstractModel');

/**
 * User Model
 */
class UserModel extends AbstractModel {
  constructor() {
    super();
    this.modelName = 'User';
    this.modelStruct = {
      identity: {
        token: String,
        ontimeToken: String,
      },
      name: {
        username: { type: String, index: { unique: true } },
        firstname: { type: String, trim: true },
        lastname: { type: String, trim: true },
      },
      info: {
        job: { type: String, trim: true },
        skype: { type: String, trim: true },
        location: { type: String, trim: true },
        organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
        email: { type: String, index: { unique: true }, require: true },
      },
    };
    this.register();
  }
}

module.exports = new UserModel();
