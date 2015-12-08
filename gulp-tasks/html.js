'use strict';

module.exports = function(gulp, plugins, npmPackages, config) {
  return function() {
    return gulp.src([config.path.public + '/index.html', config.path.client.views + '/**/*'])
      .pipe(plugins.minifyHtml({
        empty: true,
        spare: true,
        quotes: true
      }))
      .pipe(plugins.angularTemplateCache('templateCacheHtml.js', {
        module: 'corpnet',
      }))
      .pipe(gulp.dest(config.path.public + '/dist'));
  };
};