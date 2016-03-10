'use strict';

/**
 * Clean statics built for the application
 * @param gulp
 * @param plugins
 * @param npmPackages
 * @param config
 * @returns {Function}
 */
export default (gulp, plugins, npmPackages, config) => {
  return () => {
    plugins.del([
      config.path.public + '/dist',
      config.path.public + '/index.html',
      config.path.client.app + '/dist',
    ]);
  };
};
