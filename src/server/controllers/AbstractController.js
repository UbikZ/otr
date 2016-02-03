'use strict';

const otrConf = require('../config/ontime.json');
const jwt = require('jsonwebtoken');
const Http = require('./helpers/Http');

/**
 *  Abstract controller
 */
class AbstractController {
  /**
   * @param config
   */
  constructor(config) {
    this.apiCtrlName = '';
    this.config = config;
    this.otrConfig = otrConf;
    this.jwt = jwt;
  }
}

module.exports = AbstractController;