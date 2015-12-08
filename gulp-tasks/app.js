'use strict';

module.exports = function(gulp, plugins, npmPackages, config) {
  return function() {
    var b = plugins.browserify('./src/client/app/js/app.js', { debug: config.env.debug });

    npmPackages().forEach(function (id) { b.external(id); });

    npmPackages().forEach(function (id) {
      var extendId = Object.keys(config.particularities).indexOf(id) == -1 ? id : config.particularities[id];
      b.external(extendId);
    });

    var stream = b.bundle().pipe(plugins.source('app.min.js'));

    if (!config.env.debug) {
      stream.pipe(plugins.streamify(plugins.uglify({ mangle: false })));
    }

    return stream.pipe(gulp.dest(config.path.public + '/dist'));
  };
};