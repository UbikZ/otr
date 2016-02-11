'use strict';

const AbstractController = require('./AbstractController');
const path = require('path');


/**
 * Index controller: just to point on index.html
 */
class IndexController extends AbstractController {
  /**
   * Base url for all the application
   * @param   request
   * @param   response
   * @method  GET
   */
  static indexAction(request, response) {
    response.sendFile(path.join(__dirname, this.config.path.public + '/index.html'));
  }
}

module.exports = IndexController;
