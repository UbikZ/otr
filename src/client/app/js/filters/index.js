'use strict';

module.exports = function(app) {
  app.filter('sanitize', require('./sanitize'));
};
