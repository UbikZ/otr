'use strict';

module.exports = function (gulp, plugins, npmPackages, config) {
  return function () {
    gulp.src([
      config.path.public + '/lib/font-awesome/dist/css/**/*.css',
      config.path.public + '/lib/bootstrap/dist/css/**/*.css',
      config.path.client.app + '/css/{main,own}.css',
      config.path.client.print + '/css/**/*.css',
    ])
      .pipe(plugins.concat('print.min.css'))
      .pipe(plugins.ifProd(plugins.rev()))
      .pipe(plugins.ifProd(plugins.minifyCss()))
      .pipe(plugins.ifProd(gulp.dest(config.path.public + '/dist')))
      .pipe(plugins.ifProd(plugins.rev.manifest(config.path.public + '/dist/rev-manifest.print.json', {
        base: config.path.public + '/dist/',
        merge: true,
      })))
      .pipe(gulp.dest(config.path.public + '/dist'))
    ;

    return gulp.src([config.path.public + '/lib/**/*.css', 'src/client/app/css/**/*.css'])
      .pipe(plugins.concat('app.min.css'))
      .pipe(plugins.ifProd(plugins.rev()))
      .pipe(plugins.ifProd(plugins.minifyCss()))
      .pipe(plugins.ifProd(plugins.gzip({gzipOptions: {level: 9}, preExtension: 'gz'})))
      .pipe(plugins.ifProd(gulp.dest(config.path.public + '/dist')))
      .pipe(plugins.ifProd(plugins.rev.manifest(config.path.public + '/dist/rev-manifest.css.json', {
        base: config.path.public + '/dist/',
        merge: true,
      })))
      .pipe(gulp.dest(config.path.public + '/dist'))
      ;
  };
};