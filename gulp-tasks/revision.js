'use strict';

module.exports = function(gulp, plugins, npmPackages, config) {
  return function() {
    return gulp.src([config.path.public + '/dist/rev-manifest.json', config.path.client.app + '/views/index.html'])
      .pipe(plugins.ifProd(plugins.revCollector()))
      .pipe(gulp.dest(config.path.public))
      ;
  };
};