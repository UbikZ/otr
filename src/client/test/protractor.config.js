'use strict';

var waitPlugin = require('./plugins/wait');
var istanbul = require('istanbul');
var collector = new istanbul.Collector();
var config = require('../../../config');

exports.config = {
  framework: 'jasmine2',
  mochaOpts: {
    reporter: 'spec',
    timeout: 5000
  },
  plugins: [{path: './plugins/wait.js'}],
  onPrepare: function () {
    var jasmineEnv = jasmine.getEnv();

    jasmineEnv.addReporter(new function () {
      this.specDone = function (spec) {
        if (spec.status !== 'failed') {
          browser.driver.executeScript('return __coverage__;').then(function (coverageResults) {
            collector.add(coverageResults);
          });
        }
      };
    });
  },
  onComplete: function () {
    istanbul.Report.create('lcov', {dir: config.path.client.coverage})
      .writeReport(collector, true);
    waitPlugin.resolve();
  }
};