'use strict';

module.exports = function(gulp, plugins, npmPackages, config) {
  return function() {
    var nodePath = 'node_modules/';

    // Font-Awesome
    gulp.src([nodePath + '/font-awesome/fonts/*.*']).pipe(gulp.dest(config.path.public + '/dist/fonts'));

    return gulp.src([
        // Bootstrap
        nodePath + '/bootstrap/less/!(variables).less',
        nodePath + '/bootstrap/less/mixins/*.less',
        // Font Awesome
        nodePath + '/font-awesome/less/!(variables).less',
        // Animate
        nodePath + '/animate.css/animate.css',
        // Toastr
        nodePath + '/toastr/build/toastr.css',
      ], { base: nodePath }
    ).pipe(gulp.dest(config.path.public + '/lib'));
  };
};