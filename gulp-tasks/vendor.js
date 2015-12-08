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

    var stream = b.bundle().pipe(plugins.source('vendor.min.js'));

    if (!config.env.debug) {
      stream.pipe(plugins.streamify(plugins.uglify()));
    }

    return stream.pipe(gulp.dest(config.path.public + '/dist'));
  };
};