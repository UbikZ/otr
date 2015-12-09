'use strict';

// Global
window.$ = window.jQuery = require('jquery');

// External
require('angular');
require('angular-gravatar');
require('angular-ui-router');
require('angular-translate');
require('angular-ui-bootstrap');
require('ngStorage');
require('oclazyload');
require('pace').start();

// Internal
require('./controllers');
require('./directives');
require('./services');

var app = angular.module('otr', [
  'ui.router',
  'ui.bootstrap',
  'ui.gravatar',
  'oc.lazyLoad',
  'otr.controllers',
  'otr.directives',
  'otr.services',
  'pascalprecht.translate',
  'ngStorage',
]);

app.config(require('./config'));