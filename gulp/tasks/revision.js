'use strict';

import fs from 'fs';
import merge from 'merge';

/**
 * Task to add revision on each static (js && css) files if production or staging
 * @param gulp
 * @param plugins
 * @param npmPackages
 * @param config
 * @returns {Function}
 */
export default (gulp, plugins, npmPackages, config) => {
  return () => {
      fs.readFile(config.path.client.app + '/views/index.html', 'utf8', (err, data) => {
        if (err) {
          return console.log(err);
        }
        if (!config.env.debug) {
          let manifest = {};
          ['app', 'vendor', 'css', 'print'].forEach(function (el) {
            manifest = merge(manifest , require('../../' + config.path.public + '/dist/rev-manifest.' + el + '.json'));
          });
          Object.keys(manifest).forEach(element => {
            data = data.replace(element, manifest[element]);
          }, manifest);
        }

        fs.writeFile(config.path.public + '/index.html', data);
      });
  };
};