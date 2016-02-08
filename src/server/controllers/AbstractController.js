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
   * Controller Name
   * @returns {string}
   */
  static get patternUrl() {
    return '/';
  }
}

module.exports = AbstractController;