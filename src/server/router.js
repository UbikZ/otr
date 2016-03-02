'use strict';

const Http = require('./controllers/helpers/Http');
const logger = require('./logger');

const controllers = {
  'IndexController': require('./controllers/IndexController'),
  'AuthenticationController': require('./controllers/AuthenticationController'),
  'UserController': require('./controllers/UserController'),
  'OrganizationController': require('./controllers/OrganizationController'),
  'OnTimeController': require('./controllers/OnTimeController'),
  'ItemController': require('./controllers/ItemController'),
  'SettingController': require('./controllers/SettingController'),
  'PdfController': require('./controllers/PdfController')
};

const methods = {
  GET: 'GET',
  POST: 'POST',
  DELETE: 'DELETE'
};

/**
 * Router
 * @param app
 * @param router
 */
module.exports = (app, router) => {
  /**
   * Register all routes
   */
  router.routes.forEach(function(route) {
    route.subRoutes.forEach(function(subRoute) {
      const args = [app.apiUrl + route.pattern + subRoute.pattern],
        cases = {};

      if (subRoute.checkSecurity === true) {
        args.push(Http.ensureAuthorized);
      }
      args.push(controllers[route.controllerName][subRoute.actionName]);

      logger.info('[ ' + subRoute.method + ' ] ' + args[0] + ' -> ' + route.controllerName + '/' + subRoute.actionName);

      // Switch-like
      cases[methods.POST] = app.post;
      cases[methods.GET] = app.get;
      cases[methods.DELETE] = app.delete;

      if (cases[subRoute.method]) {
        cases[subRoute.method].apply(app, args);
      } else {
        throw new Error('Invalid Method : ' + subRoute.method);
      }
    });
  });
};
