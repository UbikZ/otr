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

app.config(require('./config'))
  .run(function ($rootScope, $state, $localStorage, $location, authService) {
    $rootScope.$state = $state;
    $rootScope.isAuthenticated = false;
    $rootScope.user = {};

    $rootScope.$on('$locationChangeStart', function () {
      var token = $localStorage.token;
      if (token) {
        $rootScope.isAuthenticated = true;
        if ($location.path() == '/login') {
          $location.path('/');
        }
        if (!$rootScope.user) {
          authService.me(function (user) {
            $rootScope.user = user;
          }, function (err) {
            console.error(err);
          });
        }
      } else {
        $location.path('/login');
      }
    });
  })
;