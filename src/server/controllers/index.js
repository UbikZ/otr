'use strict';

const path = require('path');

/**
 * Index controller: just to point on index.html
 * @param app
 * @param config
 */
module.exports.controller = (app, config) => {
  /**
   * Base url for all the application
   */
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, config.path.public + '/index.html'));
  });
};
