'use strict';

/**
 * Task for external javascript libraries
 * - use EcmaScript 6
 * - babel es6 to es5
 * - browserify (one final file)
 * - If production
 *    > uglify
 *    > gzip lvl 9
 *    > add revision
 * @param gulp
 * @param plugins
 * @param npmPackages
 * @param config
 * @returns {Function}
 */
export default (gulp, plugins, npmPackages, config) => {
  return () => {
    let b = plugins.browserify({ debug: con
      fig.env.debug });

    npmPackages().forEach(id => {
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