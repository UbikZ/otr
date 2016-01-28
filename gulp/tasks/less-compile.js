'use strict';

/**
 * Task for compiling less files from external libraries
 * @param gulp
 * @param plugins
 * @param npmPackages
 * @param config
 * @returns {Function}
 */
export default (gulp, plugins, npmPackages, config) => {
  return () => {
    // Font Awesome
    gulp.src(config.path.public + '/lib/font-awesome/less/font-awesome.less')
      .pipe(plugins.less())
      .pipe(gulp.dest(config.path.public + '/lib/font-awesome/dist/css'));

    // Flags
    gulp.src(config.path.public + '/lib/flag-icon-css/less/flag-icon.less')
      .pipe(plugins.less())
      .pipe(gulp.dest(config.path.public + '/lib/flag-icon-css/dist/css'));

    // Bootstrap
    return gulp.src(config.path.public + '/lib/bootstrap/less/bootstrap.less')
      .pipe(plugins.less())
      .pipe(gulp.dest(config.path.public + '/lib/bootstrap/dist/css'));
  };
};