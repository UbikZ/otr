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
}

module.exports = AbstractModel;
