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
      .state('account', {
        abstract: true,
        url: '/account',
        templateUrl: env.templatePath('common/content.html'),
        data: {includes: true, requiresLogin: true},
      })
      .state('account.profile', {
        url: '/profile',
        templateUrl: env.templatePath('profile.html'),
      })
      .state('account.manage', {
        url: '/manage',
        templateUrl: env.templatePath('manage.html'),
      })
      .state('account.contact', {
        url: '/contact',
        templateUrl: env.templatePath('contact.html'),
      })
      .state('login', {
        url: '/login',
        templateUrl: env.templatePath('login.html'),
        data: {includes: false},
      })
    ;

    $urlRouterProvider.otherwise('app/home');

    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
      return {
        'request': function (config) {
          config.headers = config.headers || {};
          if ($localStorage.token) {
            config.headers.Authorization = 'Bearer ' + $localStorage.token;
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
    }]);

    require('./translations')($translateProvider);
  }
];