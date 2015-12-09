'use strict';

var app = require('angular').module('otr.directives', []);

app.directive('sideNavigation', require('./sideNavigation'));
app.directive('minimizeSidebar', require('./minimizeSidebar'));
app.directive('slimScroll', require('./slimScroll'));