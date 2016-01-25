'use strict';

module.exports = function (gulp, plugins, npmPackages, config) {
  return function () {
    var b = plugins
      .browserify('./src/client/app/js/app.js', {debug: config.env.debug})
      .transform(plugins.babelify, {presets: ["es2015"]});

    npmPackages().forEach(function (id) {
      b.external(id);
    });

    npmPackages().forEach(function (id) {
      var extendId = Object.keys(config.particularities).indexOf(id) == -1 ? id : config.particularities[id];
      b.external(extendId);
    });

    var stream = b.bundle().pipe(plugins.source('app.min.js')).pipe(plugins.ifProd(plugins.buffer()));

    if (process.env.NODE_ENV == 'staging') {
      stream.pipe(plugins.ifProd(plugins.istanbul({
        includeUntested: true,
        coverageVariable: '__coverage__'
      })))
    }

    return stream.pipe(plugins.ifProd(plugins.rev()))
      .pipe(plugins.ifProd(plugins.streamify(plugins.uglify({mangle: false}))))
      .pipe(plugins.ifProd(plugins.gzip({gzipOptions: {level: 9}, preExtension: 'gz'})))
      .pipe(plugins.ifProd(gulp.dest(config.path.public + '/dist')))
      .pipe(plugins.ifProd(plugins.rev.manifest(config.path.public + '/dist/rev-manifest.app.json', {
        base: config.path.public + '/dist/'
      })))
      .pipe(gulp.dest(config.path.public + '/dist'))
    ;
  };
};