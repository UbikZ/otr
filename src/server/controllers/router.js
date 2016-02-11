'use strict';

const Http = require('./helpers/Http');
const logger = require('../logger');

const controllers = {
  "IndexController": require('./IndexController'),
  "AuthenticationController": require('./AuthenticationController'),
  "UserController": require('./UserController'),
  "OrganizationController": require('./OrganizationController'),
  "OnTimeController": require('./OnTimeController'),
  "ItemController": require('./ItemController'),
};

const methods = {GET: 'GET', POST: 'POST'};

/**
 * Router
 * @param app
 * @param router
 */
module.exports = (app, router) => {
  /**
   * Register all routes
   */
  router.routes.forEach(function (route) {
    route.subRoutes.forEach(function (subRoute) {
      const args = [app.apiUrl + route.pattern + subRoute.pattern];
      if (subRoute.checkSecurity === true) {
        args.push(Http.ensureAuthorized);
      }
      args.push(controllers[route.controllerName][subRoute.actionName]);

      logger.info('[ ' + subRoute.method + ' ] ' + args[0] + ' -> ' + route.controllerName + '/' + subRoute.actionName);

      switch (subRoute.method) {
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