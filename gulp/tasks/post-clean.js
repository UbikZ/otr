'use strict';

/**
 * Clean temporary folder created to compile stuffs
 * @param gulp
 * @param plugins
 * @param npmPackages
 * @param config
 * @returns {Function}
 */
export default (gulp, plugins, npmPackages, config) => {
  return () => {
    plugins.del([config.path.public + '/lib']);
  };
};
