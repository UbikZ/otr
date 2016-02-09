'use strict';

const Http = require('./helpers/Http');
const logger = require('../logger');

const IndexControllerClass = require('./IndexController');
const AuthenticationControllerClass = require('./AuthenticationController');
const UserControllerClass = require('./UserController');
const OrganizationControllerClass = require('./OrganizationController');
const OnTimeControllerClass = require('./OnTimeController');
const ItemControllerClass = require('./ItemController');

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
      url: IndexControllerClass.patterns.controller,
      instance: new IndexControllerClass(config),
      name: 'IndexController',
      subRoutes: [
        {
          method: methods.GET,
          pattern: IndexControllerClass.patterns.actions.index,
          name: 'indexAction',
          checkSecurity: false,
        }
      ],
    },
    /* Authentication */
    {
      url: AuthenticationControllerClass.patterns.controller,
      instance: new AuthenticationControllerClass(config),
      name: 'AuthenticationController',
      subRoutes: [
        {
          method: methods.POST,
          pattern: AuthenticationControllerClass.patterns.actions.signUp,
          name: 'signUpAction',
          checkSecurity: false,
        },
        {
          method: methods.GET,
          pattern: AuthenticationControllerClass.patterns.actions.me,
          name: 'meAction',
          checkSecurity: true,
        },
      ],
    },
    /* User */
    {
      url: UserControllerClass.patterns.controller,
      instance: new UserControllerClass(config),
      name: 'UserController',
      subRoutes: [
        {
          method: methods.GET,
          pattern: UserControllerClass.patterns.actions.index,
          name: 'indexAction',
          checkSecurity: true,
        },
        {
          method: methods.POST,
          pattern: UserControllerClass.patterns.actions.update,
          name: 'updateAction',
          checkSecurity: true,
        }
      ],
    },
    /* Organization */
    {
      url: OrganizationControllerClass.patterns.controller,
      instance: new OrganizationControllerClass(config),
      name: 'OrganizationController',
      subRoutes: [
        {
          method: methods.GET,
          pattern: OrganizationControllerClass.patterns.actions.index,
          name: 'indexAction',
          checkSecurity: true,
        },
        {
          method: methods.POST,
          pattern: OrganizationControllerClass.patterns.actions.edit,
          name: 'editAction',
          checkSecurity: true,
        },
        {
          method: methods.POST,
          pattern: OrganizationControllerClass.patterns.actions.delete,
          name: 'deleteAction',
          checkSecurity: true,
        }
      ],
    },
    /* OnTime */
    {
      url: OnTimeControllerClass.patterns.controller,
      instance: new OnTimeControllerClass(config),
      name: 'OnTimeController',
      subRoutes: [
        {
          method: methods.GET,
          pattern: OnTimeControllerClass.patterns.actions.me,
          name: 'meAction',
          checkSecurity: true,
        },
        {
          method: methods.GET,
          pattern: OnTimeControllerClass.patterns.actions.tree,
          name: 'treeAction',
          checkSecurity: true,
        },
        {
          method: methods.GET,
          pattern: OnTimeControllerClass.patterns.actions.items,
          name: 'itemsAction',
          checkSecurity: true,
        },
      ],
    },
    /* Item */
    {
      url: ItemControllerClass.patterns.controller,
      instance: new ItemControllerClass(config),
      name: 'ItemController',
      subRoutes: [
        {
          method: methods.GET,
          pattern: ItemControllerClass.patterns.actions.index,
          name: 'indexAction',
          checkSecurity: true,
        },
      ],
    },
  ];

  /**
   * Register all routes
   */
  routes.forEach(function (controller) {
    controller.subRoutes.forEach(function (action) {
      const args = [Application.apiUrl + controller.url + action.pattern];
      if (action.checkSecurity === true) {
        args.push(Http.ensureAuthorized);
      }
      /* jshint proto: true */
      // ES6 __proto__ is not deprecated
      args.push(controller.instance.__proto__[action.name]);
      /* jshint proto: false */

      logger.info('[ ' + action.method + ' ] ' + args[0] + ' -> ' + controller.name + '/' + action.name);

      switch (action.method) {
        case methods.POST:
          app.post.apply(app, args);
          break;
        case methods.GET:
          app.get.apply(app, args);
          break;
        default:
          throw new Error('Invalid Method : ' + action.method);
      }
    });
  });
};