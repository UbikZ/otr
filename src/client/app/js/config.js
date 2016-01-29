'use strict';

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
        templateUrl: 'common/content.html',
        data: {includes: true, requiresLogin: true},
        resolve: {
          loadPlugin: function ($ocLazyLoad) {
            return $ocLazyLoad.load([]);
          }
        }
      })
      .state(routes.APP_HOME, {
        url: '/home',
        templateUrl: 'home.html',
      })
      .state(routes.APP_USERS, {
        url: '/users',
        templateUrl: 'users/list.html',
      })
      .state(routes.ACCOUNT, {
        abstract: true,
        url: '/account',
        templateUrl: 'common/content.html',
        data: {includes: true, requiresLogin: true},
      })
      .state(routes.ACCOUNT_ONTIME, {
        url: '/ontime',
        templateUrl: 'account/ontime.html',
      })
      .state(routes.ACCOUNT_MANAGE, {
        url: '/manage',
        templateUrl: 'account/manage.html',
      })
      .state(routes.ORGANIZATIONS, {
        abstract: true,
        url: '/organizations',
        templateUrl: 'common/content.html',
        data: {includes: true, requiresLogin: true},
      })
      .state(routes.ORGANIZATIONS_LIST, {
        url: '/list',
        templateUrl: 'organizations/list.html',
      })
      .state(routes.ORGANIZATIONS_DETAIL, {
        url: '/detail/:id',
        templateUrl: 'organizations/detail.html',
      })
      .state(routes.VERSIONS, {
        abstract: true,
        url: '/versions',
        templateUrl: 'common/content.html',
        data: {includes: true, requiresLogin: true},
      })
      .state(routes.VERSIONS_PREVIEW, {
        url: '/preview/:organizationId/:documentId/:itemId',
        templateUrl: 'versions/preview.html',
      })
      .state(routes.VERSIONS_PDF, {
        url: '/pdf/:organizationId/:documentId/:itemId',
        templateUrl: 'versions/pdf.html',
        data: {includes: false}
      })
      .state(routes.ORGANIZATIONS_SETTINGS, {
        url: '/settings',
        templateUrl: 'settings/forms/edit.html',
      })
      .state(routes.LOGIN, {
        url: '/login',
        templateUrl: 'login.html',
        data: {includes: false},
      })
    ;

    $urlRouterProvider.otherwise('app/home');

    $httpProvider.interceptors.push(['$q', '$location', '$localStorage',
      function ($q, $location, $localStorage) {
        return {
          'request': function (config) {
            config.headers = config.headers || {};
            if ($localStorage.token && $localStorage.ontimeToken) {
              config.headers.Authorization = 'Bearer ' + $localStorage.token + ' ' + $localStorage.ontimeToken;
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