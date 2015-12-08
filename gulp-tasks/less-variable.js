'use strict';

module.exports = function(gulp, plugins, npmPackages, config) {
  return function() {

    // Font Awesome
    gulp.src('src/client/app/less/font-awesome/variables.less')
      .pipe(gulp.dest(config.path.public + '/lib/font-awesome/less'));

    // Bootstrap
    return gulp.src('src/client/app/less/bootstrap/variables.less')
      .pipe(gulp.dest(config.path.public + '/lib/bootstrap/less'));
  };
};