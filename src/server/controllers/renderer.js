'use strict';

var http = require('./helpers/http');
var path = require('path');
var childProcess = require('child_process');
var phantomjs = require('phantomjs2');
var binPath = phantomjs.path;

module.exports.controller = function (app, config) {

  var prefix = '/api/v' + config.api.version + '/renderer';

  /*
   * Get setting (by filtering)
   */
  app.get(prefix, /*http.ensureAuthorized,*/ function (req, res) {
    var data = req.query;
    //http.checkAuthorized(req, res, function(user) {
      //if (data.url) {
        console.log('Rendering...');
        var childArgs = [
          path.join(__dirname, '../../../scripts', 'phantomjs-script.js'),
          "http://localhost:3000/#/versions/pdf/568adb7c53df50832feb3f84/568adb9c53df50832feb3f87/568b8c448f5e804b51e91ed8"
        ];

        childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
          console.log(stdout);
          if (err != undefined) {
            console.log(err);
            http.response(res, 500, err, "-1");
          } else {
            console.log('Done');
            http.response(res, 200, {});
          }
        });
      /*} else {
        http.log(req, 'Error when user (' + user.name.username + ') rendered url (' + data.url + ')');
        http.response(res, 404, {}, "-1");
      }*/
    //});
  });
};
