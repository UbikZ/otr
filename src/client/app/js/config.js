'use strict';

var env = require('./env');

module.exports = [
  '$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$translateProvider', '$httpProvider',
  function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $translateProvider, $httpProvider) {

    $ocLazyLoadProvider.config({
      debug: true
    });

    $stateProvider
      .state('app', {
        abstract: true,
        url: '/app',
        templateUrl: env.templatePath('common/content.html'),
        data: {includes: true, requiresLogin: true},
        resolve: {
          loadPlugin: function ($ocLazyLoad) {
            return $ocLazyLoad.load([]);
          }
        }
      })
      .state('app.home', {
        url: '/home',
        templateUrl: env.templatePath('home.html'),
      })
      .state('app.users', {
        url: '/users',
        templateUrl: env.templatePath('users.html'),
      })
      .state('account', {
        abstract: true,
        url: '/account',
        templateUrl: env.templatePath('common/content.html'),
        data: {includes: true, requiresLogin: true},
      })
      .state('account.ontime', {
        url: '/ontime',
        templateUrl: env.templatePath('ontime.html'),
      })
      .state('account.manage', {
        url: '/manage',
        templateUrl: env.templatePath('manage.html'),
      })
      .state('organization', {
        abstract: true,
        url: '/organization',
        templateUrl: env.templatePath('common/content.html'),
        data: {includes: true, requiresLogin: true},
      })
      .state('organization.list', {
        url: '/list',
        templateUrl: env.templatePath('organizations.html'),
      })
      .state('login', {
        url: '/login',
        templateUrl: env.templatePath('login.html'),
        data: {includes: false},
      })
    ;

    $urlRouterProvider.otherwise('app/home');

    $httpProvider.interceptors.push(['$q', '$location', '$localStorage',
      function ($q, $location, $localStorage) {
        return {
          'request': function (config) {
            config.headers = config.headers || {};
            if ($localStorage.token && $localStorage.ot_token) {
              config.headers.Authorization = 'Bearer ' + $localStorage.token + ' ' + $localStorage.ot_token;
            }

            return config;
          },
          'responseError': function (response) {
            if (response.status === 401 || response.status === 403) {
              $location.path('/login');
            }

            return $q.reject(response);
          }
        };
      }
    ]);

    require('./translations')($translateProvider);
  }
];