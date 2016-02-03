'use strict';

const Http = require('./helpers/Http');

const IndexControllerClass = require('./IndexController');
const AuthenticationControllerClass = require('./AuthenticationController');
const UserControllerClass = require('./UserController');

/**
 * Router
 * @param Application
 */
module.exports = (Application) => {
  const config = Application.config;
  const app = Application.app;
  const apiUrl = Application.apiUrl;

  // Instantiate controllers
  const IndexController = new IndexControllerClass(config);
  const AuthenticationController = new AuthenticationControllerClass(config);
  const UserController = new UserControllerClass(config);

  /**
   * Bindings
   */
  /* Initiate */
  app.get(apiUrl + '/', IndexController.indexAction);

  /* Authentication */
  app.post(apiUrl + '/sign-up', AuthenticationController.signUpAction);
  app.get(apiUrl + '/me', AuthenticationController.meAction);

  /* User */
  app.get(apiUrl + '/user', Http.ensureAuthorized, UserController.indexAction);
  app.post(apiUrl + '/user', Http.ensureAuthorized, UserController.updateAction);
};