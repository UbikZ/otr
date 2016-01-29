'use strict';

import typescript from 'typescript';

/**
 * Task for application javascript
 * - exclude vendor
 * - transpile TypeScript
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
    let b = plugins
      .browserify('./src/client/app/js/app.js', {debug: config.env.debug})
      //.plugin(plugins.tsify, { target: 'es6', typescript})
      .transform(plugins.babelify, {presets: ["es2015"]});

    npmPackages().forEach(id => {
      b.external(id);
    });

    npmPackages().forEach(id => {
      let extendId = !~Object.keys(config.particularities).indexOf(id) ? id : config.particularities[id];
      b.external(extendId);
    });

    let stream = b.bundle().pipe(plugins.source('app.min.js')).pipe(plugins.ifProd(plugins.buffer()));

    /*if (process.env.NODE_ENV === 'staging') {
     stream.pipe(plugins.ifProd(plugins.istanbul({
     includeUntested: true,
     coverageVariable: '__coverage__'
     })))
     }*/

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