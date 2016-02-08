'use strict';

const Http = require('./helpers/Http');
const logger = require('../logger');

const IndexControllerClass = require('./IndexController');
const AuthenticationControllerClass = require('./AuthenticationController');
const UserControllerClass = require('./UserController');
const OrganizationControllerClass = require('./OrganizationController');

const methods = {GET: 'GET', POST: 'POST'};

/**
 * Router
 * @param Application
 */
module.exports = (Application) => {
  const config = Application.config;
  const app = Application.app;

  const routes = [
    /* Index */
    {
      url: IndexControllerClass.patternUrl,
      method: methods.GET,
      instance: new IndexControllerClass(config),
      name: 'IndexController',
      action: 'indexAction',
      checkSecurity: false,
    },
    /* Authentication */
    {
      url: AuthenticationControllerClass.patternUrl + '/sign-up',
      method: methods.POST,
      instance: new AuthenticationControllerClass(config),
      name: 'AuthenticationController',
      action: 'signUpAction',
      checkSecurity: false,
    },
    {
      url: AuthenticationControllerClass.patternUrl + '/me',
      method: methods.GET,
      instance: new AuthenticationControllerClass(config),
      name: 'AuthenticationController',
      action: 'meAction',
      checkSecurity: true,
    },
    /* User */
    {
      url: UserControllerClass.patternUrl,
      method: methods.GET,
      instance: new UserControllerClass(config),
      name: 'UserController',
      action: 'indexAction',
      checkSecurity: true,
    },
    {
      url: UserControllerClass.patternUrl + '/update',
      method: methods.POST,
      instance: new UserControllerClass(config),
      name: 'UserController',
      action: 'updateAction',
      checkSecurity: true,
    },
    /* Organization */
    {
      url: OrganizationControllerClass.patternUrl,
      method: methods.GET,
      instance: new OrganizationControllerClass(config),
      name: 'OrganizationController',
      action: 'indexAction',
      checkSecurity: true,
    },
  ];

  /**
   * Register all routes
   */
  routes.forEach(function(controller) {
    const args = [Application.apiUrl + controller.url];
    if (controller.checkSecurity === true) {
      args.push(Http.ensureAuthorized);
    }
    args.push(controller.instance.__proto__[controller.action]);

    logger.info('[ ' + controller.method + ' ] ' + args[0] + ' -> ' + controller.name + '/' + controller.action);

    switch (controller.method) {
      case methods.POST:
        app.post.apply(app, args);
        break;
      case methods.GET:
        app.get.apply(app, args);
        break;
      default:
        throw new Error('Invalid Method : ' + controller.method);
        break;
    }
  });
};