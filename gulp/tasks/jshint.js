'use strict';

import jshintStylish from 'jshint-stylish';

/**
 * Task to check javascript linting
 * @param gulp
 * @param plugins
 * @param npmPackages
 * @param config
 * @returns {Function}
 */
export default (gulp, plugins, npmPackages, config) => {
  return () => {
    const exitOnJshintError = plugins.mapStream(function (file) {
      if (!file.jshint.success) {
        console.error('jshint failed');
        process.exit(1);
      }
    });

    return gulp.src([
      config.path.client.app + '/js/**/*.js',
      'app.js',
      config.path.server.root + '/**/*.js',
      config.path.scripts + '/**/*.js',
    ]).pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter(jshintStylish))
      .pipe(exitOnJshintError);
  };
};