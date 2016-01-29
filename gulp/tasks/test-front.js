'use strict';

/**
 * ONLY IN STAGE ENV
 * Task to execute FRONT-END e2e tests
 * - Use Protractor for AngularJS
 * @param gulp
 * @param plugins
 * @param npmPackages
 * @param config
 * @returns {Function}
 */
export default (gulp, plugins, npmPackages, config) => {
  return () => {
    if (process.env.NODE_ENV === 'staging') {
      /*return gulp.src([config.path.client.test])
       .pipe(plugins.angularProtractor({
       'configFile': config.path.client.test.concat('/protractor.config.js'),
       'autoStartStopServer': true,
       'debug': true
       }))
       .on('error', error => {
       throw error
       });*/
    }
    return;
  };
};