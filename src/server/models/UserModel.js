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

  /**
   * Parse params for User
   * @param  {Object} parameters
   * @return {Object}
   */
  parseParams(parameters) {
    const params = parameters || {};
    let result = super.parseParams(parameters);

    ['name.username', 'info.email'].forEach(key => {
      this.attachParam(result, params, key);
    });

    return result;
  }

  /**
   * Parse request data
   * @param  {Object} model existing model to add data
   * @param  {Object} data
   * @return {Object}
   */
  parseData(model, data) {
    let result = model || {};

    ['name.username', 'name.firstname', 'name.lastname', 'info.skype', 'info.location', 'info.job'].forEach(key => {
      this.attachParam(result, data, key);
    });

    return result;
  }
}

module.exports = new UserModel();
