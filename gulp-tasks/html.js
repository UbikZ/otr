'use strict';

module.exports = function (gulp, plugins, npmPackages, config) {
  return function () {
    return gulp.src([config.path.client.app + '/views/**/*'])
      .pipe(plugins.minifyHtml({empty: true, spare: true, quotes: true}))
      .pipe(plugins.angularTemplateCache(
        'template-cache.js',
        { module: 'gulp.cached.tmpl', moduleSystem: 'Browserify', standalone: true}
      ))
      .pipe(gulp.dest(config.path.client.app + '/dist/cache'));
  };
};