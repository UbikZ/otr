'use strict';

var env = require('./env');

module.exports = [
  '$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$translateProvider', '$httpProvider', '_CONST',
  function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $translateProvider, $httpProvider, _CONST) {

    var routes = _CONST.ROUTES;

    $ocLazyLoadProvider.config({
      debug: true
    });

    $stateProvider
      .state(routes.APP, {
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
      .state(routes.APP_HOME, {
        url: '/home',
        templateUrl: env.templatePath('home.html'),
      })
      .state(routes.APP_USERS, {
        url: '/users',
        templateUrl: env.templatePath('users/list.html'),
      })
      .state(routes.ACCOUNT, {
        abstract: true,
        url: '/account',
        templateUrl: env.templatePath('common/content.html'),
        data: {includes: true, requiresLogin: true},
      })
      .state(routes.ACCOUNT_ONTIME, {
        url: '/ontime',
        templateUrl: env.templatePath('account/ontime.html'),
      })
      .state(routes.ACCOUNT_MANAGE, {
        url: '/manage',
        templateUrl: env.templatePath('account/manage.html'),
      })
      .state(routes.ORGANIZATIONS, {
        abstract: true,
        url: '/organizations',
        templateUrl: env.templatePath('common/content.html'),
        data: {includes: true, requiresLogin: true},
      })
      .state(routes.ORGANIZATIONS_LIST, {
        url: '/list',
        templateUrl: env.templatePath('organizations/list.html'),
      })
      .state(routes.ORGANIZATIONS_SETTINGS, {
        url: '/settings',
        templateUrl: env.templatePath('settings/forms/edit.html'),
      })
      .state(routes.ORGANIZATIONS_DETAIL, {
        url: '/detail/:id',
        templateUrl: env.templatePath('organizations/detail.html'),
      })
      .state(routes.LOGIN, {
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