'use strict';

/**
 * Generate API Documentation
 * - expressJS
 * @param gulp
 * @param plugins
 * @param npmPackages
 * @param config
 * @returns {Function}
 */
export default (gulp, plugins, npmPackages, config) => {
  return done => {
    return plugins.docApi({
      src: config.path.server.controller,
      dest: config.path.documentation,
      includeFilters: ['.*\\.js$'],
    }, done);
  };
};