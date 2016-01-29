'use strict';

var app = require('../../../app');
var config = require('../../../config');

if (process.env.NODE_ENV != 'staging') {
  process.exit(1);
}

describe('> Application', function () {
  var stagingUrl = 'http://localhost:'.concat(config.env[process.env.NODE_ENV].port);

  ['app'].forEach(function (spec) {
    require('./scenarios/'.concat(spec, '.specs'))(stagingUrl, config);
  });
});
