'use strict';

exports.config = {
  framework: 'mocha',
  mochaOpts: {
    reporter: 'dot',
    timeout: 2000
  },
  /*multiCapabilities: [
    {
      'browserName': 'firefox'
    },
    {
      'browserName': 'chrome'
    },
    {
      'browserName': 'safari'
    }
  ]*/
};