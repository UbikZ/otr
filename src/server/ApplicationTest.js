'use strict';

const AbstractApplication = require('./AbstractApplication');

/**
 *
 */
class ApplicationTest extends AbstractApplication {
  /**
   * @param config
   */
  constructor(config) {
    super(config);
  }

  /**
   *
   * @private
   */
  _checkSettings() {
    super._checkSettings();

    if (!~['staging'].indexOf(process.env.NODE_ENV)) {
      throw 'Wrong NODE_ENV (' + process.env.NODE_ENV + ') set for the test application';
    }
  }
}

module.exports = ApplicationTest;