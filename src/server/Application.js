'use strict';

const AbstractApplication = require('./AbstractApplication');

/**
 *
 */
class Application extends AbstractApplication {
  /**
   *
   * @private
   */
  _checkSettings() {
    super._checkSettings();

    this.logger.info(process.env.NODE_ENV);
    if (!~['production', 'development'].indexOf(process.env.NODE_ENV)) {
      throw 'Wrong NODE_ENV (' + process.env.NODE_ENV + ') set for the application';
    }
  }
}

module.exports = Application;
