'use strict';

// Global
window.$ = window.jQuery = require('jquery');

$('#wrapper').hide();

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

require('../dist/cache/template-cache');

var app = angular.module('otr', [
  'ui.router',
  'ui.bootstrap',
  'gulp.cached.tmpl',
  'ui.gravatar',
  'oc.lazyLoad',
  'pascalprecht.translate',
  'ngStorage',
  'ngLocale',
  'treeControl',
]);

// Internal
require('./controllers')(app);
require('./directives')(app);
require('./services')(app);
require('./filters')(app);

app
  .constant('_CONST', require('./constants'))
  .config(require('./config'))
  .run(function ($rootScope, $state, $localStorage, $location, authService, _CONST, $templateCache) {
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

    $rootScope.enableUi = function() {
      $('#wrapper').fadeIn();
      $('#wrapper-loader').fadeOut();
    };

    $rootScope.$on('$locationChangeStart', function (event, toState) {
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