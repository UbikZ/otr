'use strict';

var path = require('path');
var childProcess = require('child_process');
var fs = require('fs');
var moment = require('moment');

var http = require('./helpers/http');
var logger = require('../logger');

module.exports.controller = function (app, config) {

  var binPath;

  try {
    binPath = require('phantomjs').path;
  } catch (e) {
    binPath = config.bin.phantomjs;
  }

  var prefix = '/api/v' + config.api.version;

  /*
   * Get setting (by filtering)
   */
  app.get(prefix.concat('/renderer'), http.ensureAuthorized, function (req, res) {
    var data = req.query;
    http.checkAuthorized(req, res, function (user) {
      if (data.url) {
        var filePath = config.path.export.concat(
          '/',
          data.name.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
          moment().format('.YYYYMMDDHHmmSS'),
          '.pdf'
        );
        var fullUrl = req.protocol + '://' + req.get('host') + '/#' + data.url;

        var childArgs = [
          path.join(__dirname, '../../../scripts', 'phantomjs-script.js'),
          fullUrl,
          filePath,
          1
        ];

        childProcess.execFile(binPath, childArgs, function (err, stdout) {
          logger.error(stdout);
          if (err) {
            logger.error(err);
          }
          if (!fs.existsSync(filePath)) {
            http.response(res, 500, {}, '-1');
          } else {
            http.response(res, 200, {fileName: path.basename(filePath)});
          }
        });
      } else {
        http.log(req, 'Error when user (' + user.name.username + ') rendered url (' + data.url + ')');
        http.response(res, 404, {}, '-1');
      }
    });
  });

  app.get(prefix.concat('/download'), http.ensureAuthorized, function (req, res) {
    var data = req.query;
    http.checkAuthorized(req, res, function (user) {
      if (data.fileName) {
        if (!fs.existsSync(config.path.export.concat('/', data.fileName))) {
          http.response(res, 500, {}, '-1');
        } else {
          res.download(config.path.export.concat('/', data.fileName), function (err) {
            if (err) {
              logger.error(err);
            } else {
              fs.unlink(config.path.export.concat('/', data.fileName));
            }
          });
        }
      } else {
        http.log(req, 'Error when user (' + user.name.username + ') download file (' + data.fileName + ')');
        http.response(res, 404, {}, '-1');
      }
    });
  });
};
