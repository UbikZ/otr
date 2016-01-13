'use strict';

module.exports = function (gulp, plugins, npmPackages, config) {
  return function () {
    var printStream = gulp.src([
      config.path.public + '/lib/font-awesome/dist/css/**/*.css',
      config.path.public + '/lib/bootstrap/dist/css/**/*.css',
      config.path.client.app + '/css/{main,own}.css',
      config.path.client.print + '/css/**/*.css',
    ]).pipe(plugins.concat('print.min.css'));

    if (!config.env.debug) {
      printStream.pipe(plugins.minifyCss());
    }

    printStream.pipe(gulp.dest(config.path.public + '/dist'));

    var stream = gulp.src([config.path.public + '/lib/**/*.css', 'src/client/app/css/**/*.css'])
      .pipe(plugins.concat('app.min.css'));

    if (!config.env.debug) {
      stream.pipe(plugins.minifyCss());
    }

    return stream.pipe(gulp.dest(config.path.public + '/dist'));
  };
};