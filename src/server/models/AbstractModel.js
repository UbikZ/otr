'use strict';

const mongoose = require('mongoose');

/**
 * Abstract Model
 */
class AbstractModel {
  constructor() {
    this.modelName = '';
    this.modelStruct = {};
    this.modelSchema = new mongoose.Schema();
    this.model = undefined;
  }

  /**
   * Register schema in mongoose
   */
  register() {
    try {
      this.model = mongoose.model(this.modelName);
      console.log('## ' + this.modelName + ' already LOADED ##');
    } catch (exception) {
      this.modelSchema.add(this.modelStruct);
      this.model = mongoose.model(this.modelName, this.modelSchema);
      console.log('## LOAD ' + this.modelName + ' ##');
    }
  }

  /**
   * Return the Schema
   * @return {Object}
   */
  get schema() {
    return this.model.schema;
  }

  /**
   * Handle parameters parsing
   * @param  {ObjectId} parameters Parameters from HTTP query (for example)
   * @return {Object}              Formatted return with pre-parsed parameters
   */
  parseParams(parameters) {
    const params = parameters || {};
    let result = {};

    if (params.id) {
      result._id = new mongoose.Types.ObjectId(params.id);
    }

    return result;
  }

  /**
   * Attach / Set parameters
   * @param  {Object} data   Data to parse
   * @param  {String} key    key string for parameter
   * @return {object}
   */
  attachParam(data, key, type) {
    var item = {};
    if (data[key] !== undefined) {
      item = this._recurse(key.split('.'), this._parseResult(data[key], type));
    }

    return item;
  }

  /**
   * Parse result by Type
   * - if no type provided, we send the data with no parsing
   * @param  {Any} data data to parse
   * @param  {String} type type of the data
   * @return {Any}        data parsed
   */
  _parseResult(data, type) {
    const cases = {
      boolean: data => !!data,
    };

    if (cases[type]) {
      return cases[type](data);
    }
    return data;
  }

  /**
   * Recursive method to handle generic key parameter
   * @param  {Array<Object>} elements
   * @param  {Object} data
   * @return {Object}
   */
  _recurse(elements, data) {
    var obj = {};
    if (elements.length === 1) {
      obj[elements.shift()] = data;
    } else {
      obj[elements.shift()] = this._recurse(elements, data);
    }
    return obj;
  }
}

module.exports = AbstractModel;
