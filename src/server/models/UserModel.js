'use strict';

const mongoose = require('mongoose');
const merge = require('merge');
const jwt = require('jsonwebtoken');

const otrConf = require('../config/ontime');

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
    const elements = [
      { name: 'name.username', type: 'string' },
      { name: 'info.email', type: 'string' },
    ];
    elements.forEach(object => {
      result = merge.recursive(result, this.attachParam(params, object.name, object.key));
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
    const elements = [
      { name: 'name.username', type: 'string' },
      { name: 'name.firstname', type: 'string' },
      { name: 'name.lastname', type: 'string' },
      { name: 'info.skype', type: 'string' },
      { name: 'info.location', type: 'string' },
      { name: 'info.job', type: 'string' },
    ];
    elements.forEach(object => {
      result = merge.recursive(result, this.attachParam(data, object.name, object.type));
    });

    return result;
  }

  /**
   * Parse request from ontime
   * @param  {Object} model
   * @param  {Object} data
   * @return {Object}       Updated model (not necessary)
   */
  parseDataFromOntime(model, data) {
    model.info.email = data.email;
    model.name.username = data.username;
    /*jshint camelcase: false */
    model.name.firstname = data.first_name;
    model.name.lastname = data.last_name;
    /*jshint camelcase: true */
    model.identity.token = jwt.sign(model._id, otrConf.jwtSecret);

    return model;
  }
}

module.exports = new UserModel();
