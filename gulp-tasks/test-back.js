'use strict';

module.exports = function (gulp, plugins, npmPackages, config) {
  return function () {
    if (process.env.NODE_ENV === 'staging') {
      return gulp.src(['app.js', config.path.server.root + '/**/*.js'])
        .pipe(plugins.istanbul({includeUntested: true}))
        .pipe(plugins.istanbul.hookRequire())
        .on('finish', function () {
          return gulp.src(config.path.server.test + '/index.js')
            .pipe(plugins.mocha({reporter: 'spec'}))
            .pipe(plugins.istanbul.writeReports())
            .on('end', function() {
              //if (!process.env.CI) {
                gulp.src(config.path.coverage.concat('/lcov.info'))
                  .pipe(plugins.coveralls());
              //}
              process.exit();
            });
        });
    }
    return;
  };
};