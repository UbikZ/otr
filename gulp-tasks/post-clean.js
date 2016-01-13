'use strict';

module.exports = function(gulp, plugins, npmPackages, config) {
  return function() {
    plugins.del([config.path.public + '/lib', config.path.client.app + '/dist']);
  };
};