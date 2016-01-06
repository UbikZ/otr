'use strict';

module.exports = function(gulp, plugins, npmPackages, config) {
  return function() {
    var nodePath = 'node_modules/';

    // Font-Awesome & Print
    gulp.src([nodePath + '/font-awesome/fonts/*.*', config.path.client.print + '/font/*.*'])
      .pipe(gulp.dest(config.path.public + '/dist/fonts'));

    // Flags
    gulp.src([nodePath + '/flag-icon-css/flags/**/*.*']).pipe(gulp.dest(config.path.public + '/dist/flags'));

    return gulp.src([
        // Bootstrap
        nodePath + '/bootstrap/less/!(variables).less',
        nodePath + '/bootstrap/less/mixins/*.less',
        nodePath + '/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css',
        // Flags
        nodePath + '/flag-icon-css/less/!(variabless).less',
        // TreeControl
        nodePath + 'angular-tree-control/css/tree-control-attribute.css',
        // Font Awesome
        nodePath + '/font-awesome/less/!(variables).less',
        // Animate
        nodePath + '/animate.css/animate.css',
        // Spinkit
        nodePath + '/spinkit/css/spinkit.css',
        // Toastr
        nodePath + '/toastr/build/toastr.css',
        // iHover
        nodePath + '/ihover/src/ihover.css',
        // Flags
        nodePath + '/flag-icon-css/css/flag-icon.css',
      ], { base: nodePath }
    ).pipe(gulp.dest(config.path.public + '/lib'));
  };
};