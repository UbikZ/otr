'use strict';

module.exports = function (app) {
  app.directive('sideNavigation', require('./sideNavigation'));
  app.directive('minimizeSidebar', require('./minimizeSidebar'));
  app.directive('slimScroll', require('./slimScroll'));
};

