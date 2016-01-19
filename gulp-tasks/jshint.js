'use strict';

require('jshint-stylish');

module.exports = function (gulp, plugins, npmPackages, config) {
  return function () {
    return gulp.src([
      config.path.client.app + '/js/**/*.js',
      'app.js',
      config.path.server.root + '/**/*.js',
      config.path.scripts + '/**/*.js',
    ]).pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.jshint.reporter({fail: true}));
  };
};