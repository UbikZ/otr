'use strict';

/**
 * Task to copy less variables files in the temporary folder
 * @param gulp
 * @param plugins
 * @param npmPackages
 * @param config
 * @returns {Function}
 */
export default (gulp, plugins, npmPackages, config) => {
  return () => {
    // Font Awesome
    gulp.src('src/client/app/less/font-awesome/variables.less')
      .pipe(gulp.dest(config.path.public + '/lib/font-awesome/less'));

    // Flags
    gulp.src('src/client/app/less/flag-icon-css/variabless.less')
      .pipe(gulp.dest(config.path.public + '/lib/flag-icon-css/less'));

    // Bootstrap
    return gulp.src('src/client/app/less/bootstrap/{variables,bootstrap}.less')
      .pipe(gulp.dest(config.path.public + '/lib/bootstrap/less'));
  };
};
