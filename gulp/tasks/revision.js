'use strict';

var fs = require('fs');
var merge = require('merge');

module.exports = function (gulp, plugins, npmPackages, config) {
  return function () {
    fs.readFile(config.path.client.app + '/views/index.html', 'utf8', function (err, data) {
      if (err) {
        return console.log(err);
      }
      if (!config.env.debug) {
        var manifest = {};
        ['app', 'vendor', 'css', 'print'].forEach(function (el) {
          manifest = merge(manifest, require('../../' + config.path.public + '/dist/rev-manifest.' + el + '.json'));
        });
        Object.keys(manifest).forEach(element => {
          data = data.replace(element, manifest[element]);
        }, manifest);
      }

      fs.writeFile(config.path.public + '/index.html', data);
    });
  };
};