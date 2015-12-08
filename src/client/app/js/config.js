'use strict';

var env = require('./env');

module.exports = function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $translateProvider) {

  $ocLazyLoadProvider.config({
    debug: true
  });

  $stateProvider
    .state('app', {
      abstract: true,
      url: '/app',
      templateUrl: env.templatePath('common/content.html'),
      data: { includes: true, requiresLogin: true },
      resolve: {
        loadPlugin: function($ocLazyLoad) {
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
      data: { includes: true , requiresLogin: true },
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
      data: { includes: false },
    })
  ;

  $urlRouterProvider.otherwise('app/home');

  require('./translations')($translateProvider);
};