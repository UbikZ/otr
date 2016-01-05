'use strict';

// Global
window.$ = window.jQuery = require('jquery');

// External
require('angular');
require('angular-gravatar');
require('angular-ui-router');
require('angular-translate');
require('angular-ui-bootstrap');
require('angular-tree-control');
require('ngstorage');
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
  'ngLocale',
  'treeControl',
]);

app
  .constant('_CONST', require('./constants'))
  .config(require('./config'))
  .run(function ($rootScope, $state, $localStorage, $location, authService, _CONST) {
    $rootScope.$state = $state;
    $rootScope.const = _CONST;
    $rootScope.routes = _CONST.ROUTES;
    $rootScope.isAuthenticated = false;
    $rootScope.user = $localStorage.user ? JSON.parse($localStorage.user) : undefined;
    $rootScope.pdf = {enabled: false, loaded: false};

    $rootScope.logout = function () {
      $rootScope.isAuthenticated = false;
      $rootScope.user = undefined;
      delete $localStorage.user;
      delete $localStorage.token;
      delete $localStorage.ot_token;
    };

    $rootScope.$on('$locationChangeStart', function (event, toState, toParams, fromState, fromParams) {
      if (~toState.indexOf('pdf')) {
        $rootScope.pdf.enabled = true;
      } else if ($localStorage.token && $localStorage.ot_token) {
        $rootScope.isAuthenticated = true;
        if ($location.path() == '/login') {
          $location.path('/');
        }
        if ($rootScope.user == undefined) {
          authService.me(function (user) {
            $rootScope.user = user;
          }, function (err) {
            console.error(err);
          });
        }
        $localStorage.user = JSON.stringify($rootScope.user);
      } else {
        $rootScope.logout();
        $location.path('/login');
      }
    });
  })
;