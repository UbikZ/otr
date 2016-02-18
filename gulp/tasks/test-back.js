'use strict';

/**
 * ONLY IN STAGE ENV
 * Task to execute BACK-END unit tests
 * - Coverage with Istanbul
 * - Tests with Mocha
 * - Push coverage on coveralls
 * @param gulp
 * @param plugins
 * @param npmPackages
 * @param config
 * @returns {Function}
 */
export default (gulp, plugins, npmPackages, config) => {
  return () => {
    if (process.env.NODE_ENV === 'staging') {
      return gulp
        .src([
          config.path.server.root + '/**/*.js',
          '!' + config.path.server.root + '/test/**/*',
          '!' + config.path.server.root + '/Application.js'
        ])
        .pipe(plugins.istanbul({ includeUntested: true }))
        .pipe(plugins.istanbul.hookRequire())
        .on('finish', () => {
          return gulp.src(config.path.server.test + '/index.js')
            .pipe(plugins.mocha({ reporter: 'spec', compilers: ['js:babel-core/register'] }))
            .pipe(plugins.istanbul.writeReports({ dir: config.path.server.coverage }))
            .on('end', () => {
              //if (!process.env.CI) {
              gulp.src(config.path.server.coverage + '/lcov.info')
                .pipe(plugins.coveralls());
              //}
              process.exit();
            });
        });
    }
    return;
  };
};