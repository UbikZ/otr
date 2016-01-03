'use strict';

module.exports = function(gulp, plugins, npmPackages, config) {
  return function() {

    // Font Awesome
    gulp.src('src/client/app/less/font-awesome/variables.less')
      .pipe(gulp.dest(config.path.public + '/lib/font-awesome/less'));

    // Flags
    gulp.src('src/client/app/less/flag-icon-css/variabless.less')
      .pipe(gulp.dest(config.path.public + '/lib/flag-icon-css/less'));

    // Bootstrap
    return gulp.src('src/client/app/less/bootstrap/variables.less')
      .pipe(gulp.dest(config.path.public + '/lib/bootstrap/less'));
  };
};