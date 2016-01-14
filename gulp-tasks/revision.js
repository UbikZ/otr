'use strict';

var fs = require('fs');

module.exports = function (gulp, plugins, npmPackages, config) {
  return function () {
      fs.readFile(config.path.client.app + '/views/index.html', 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }
        if (!config.env.debug) {
          var manifest = require('../' + config.path.public + '/dist/rev-manifest.json');
          for (var key in manifest) {
            data = data.replace(key, manifest[key]);
          }
        }

        fs.writeFile(config.path.public + '/index.html', data);
      });
  };
};