'use strict';

const otrConf = require('../config/ontime.json');
const jwt = require('jsonwebtoken');
const http = require('./helpers/http');

/**
 *  Abstract controller
 */
class AbstractController {
  /**
   * @param config
   */
  constructor(config) {
    this.config = config;
    this.otrConfig = otrConf;
    this.jwt = jwt;
  }

  /**
   * Send a response
   * - If status code is not 200, it's probably an issue and we log it
   * @param request
   * @param response
   * @param status
   * @param data
   * @param msgCode
   * @param msgLog
   * @param err
   */
  static sendResponse(request, response, status, data, msgCode, msgLog, err) {
    if (status !== 200) {
      http.log(request, msgLog, err);
    }
    http.response(response, status, data, msgCode, err);
  }
}

module.exports = AbstractController;