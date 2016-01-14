'use strict';

module.exports = function(gulp, plugins, npmPackages, config) {
  return function() {
    plugins.del([
      config.path.public + '/dist',
      config.path.public + '/index.html',
      config.path.client.app + '/dist',
    ]);
  };
};