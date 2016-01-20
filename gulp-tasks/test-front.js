'use strict';

module.exports = function (gulp, plugins, npmPackages, config) {
  return function () {
    if (process.env.NODE_ENV === 'staging') {
      return gulp.src([config.path.client.test.concat('/scenarios/**/*.js')])
        .pipe(plugins.angularProtractor({
          'configFile': config.path.client.test.concat('/protractor.config.js'),
          'autoStartStopServer': true,
          'debug': true
        }))
        .on('error', function (e) {
          throw e
        });
    }
    return;
  };
};