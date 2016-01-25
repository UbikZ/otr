'use strict';

module.exports = function(gulp, plugins, npmPackages, config) {
  return function() {
    var b = plugins.browserify({ debug: config.env.debug });

    npmPackages().forEach(function (id) {
      if (Object.keys(config.particularities).indexOf(id) == -1) {
        b.require(plugins.nodeResolve.sync(id), { expose: id });
      } else {
        b.require(config.particularities[id]);
      }
    });

    return b.bundle()
      .pipe(plugins.source('vendor.min.js'))
      .pipe(plugins.ifProd(plugins.buffer()))
      .pipe(plugins.ifProd(plugins.rev()))
      .pipe(plugins.ifProd(plugins.streamify(plugins.uglify())))
      .pipe(plugins.ifProd(plugins.gzip({gzipOptions: {level: 9}, preExtension: 'gz' })))
      .pipe(plugins.ifProd(gulp.dest(config.path.public + '/dist')))
      .pipe(plugins.ifProd(plugins.rev.manifest(config.path.public + '/dist/rev-manifest.vendor.json', {
        base: config.path.public + '/dist/',
      })))
      .pipe(gulp.dest(config.path.public + '/dist'))
      ;
  };
};