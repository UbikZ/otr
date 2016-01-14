'use strict';

var fs = require('fs');

module.exports = function (gulp, plugins, npmPackages, config) {
  return function () {
    var manifest = require('../' + config.path.public + '/dist/rev-manifest.json');

    fs.readFile(config.path.client.app + '/views/index.html', 'utf8', function (err, data) {
      if (err) {
        return console.log(err);
      }
      for (var key in manifest) {
        data = data.replace(key, manifest[key]);
      }

      fs.writeFile(config.path.public + '/index.html', data);
    });

    /*return gulp.src([config.path.public + '/dist/rev-manifest.json', config.path.client.app + '/views/index.html'])
     .pipe(plugins.ifProd(plugins.revCollector({replaceReved: true})))
     .pipe(gulp.dest(config.path.public))
     ;*/
  };
};