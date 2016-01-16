'use strict';

var path = require('path');
var childProcess = require('child_process');
var http = require('./helpers/http');

module.exports.controller = function (app, config) {

  var binPath;

  try {
    binPath = require('phantomjs').path;
  } catch (e) {
    binPath = config.bin.phantomjs;
  }

  var prefix = '/api/v' + config.api.version + '/renderer';

  /*
   * Get setting (by filtering)
   */
  app.get(prefix, http.ensureAuthorized, function (req, res) {
    var data = req.query;
    http.checkAuthorized(req, res, function (user) {
      if (data.url) {
        var fullUrl = req.protocol + '://' + req.get('host') + '/#' + data.url;
        logger.info('[Start] Rendering: ' + fullUrl);
        var childArgs = [
          path.join(__dirname, '../../../scripts', 'phantomjs-script.js'),
          fullUrl,
        ];

        childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
          logger.debug(stdout);
          if (err != undefined) {
            logger.error(err);
            http.response(res, 500, err, "-1");
          } else {
            logger.info('[End] Rendering: ' + fullUrl);
            http.response(res, 200, {});
          }
        });
      } else {
        http.log(req, 'Error when user (' + user.name.username + ') rendered url (' + data.url + ')');
        http.response(res, 404, {}, "-1");
      }
    });
  });
};
