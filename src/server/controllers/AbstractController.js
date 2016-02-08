'use strict';

const otrConf = require('../config/ontime.json');
const jwt = require('jsonwebtoken');

/**
 *  Abstract controller
 */
class AbstractController {
  /**
   * @param config
   */
  constructor(config) {
    this.config = config;
    this.otrConfig = otrConf;
    this.jwt = jwt;
  }

  /**
   * Scoped routes patterns
   * @returns {{controller: string, actions: {}}}
   */
  static get patterns() {
    return {controller: '/', actions: {}};
  }
}

module.exports = AbstractController;