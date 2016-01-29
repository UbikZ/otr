'use strict';

/**
 * Task for html caching
 * - concat html
 * - minify html
 * - create javascript file for cache templating (will be add with browserify)
 * @param gulp
 * @param plugins
 * @param npmPackages
 * @param config
 * @returns {Function}
 */
export default (gulp, plugins, npmPackages, config) => {
  return () => {
    return gulp.src([config.path.client.app + '/views/**/*', '!' + config.path.client.app + '/views/index.html'])
      .pipe(plugins.minifyHtml({empty: true, spare: true, quotes: true}))
      .pipe(plugins.angularTemplateCache(
        'template-cache.js',
        {module: 'gulp.cached.tmpl', moduleSystem: 'Browserify', standalone: true}
      ))
      .pipe(gulp.dest(config.path.client.app + '/dist/cache'));
  };
};